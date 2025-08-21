#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import path from "path";
import Command, { Flags } from "../../builderCommand.mjs";

export default class CampaignTranslate extends Command {
  static description =
    "Translate a campaign's locale file from one language to another.";

  static flags = {
    campaign: Flags.string({
      char: "c",
      description: "Name of the campaign to translate.",
      required: true,
    }),
    from: Flags.string({
      description: "Source language for translation.",
      default: "en",
    }),
    to: Flags.string({
      description: "Target language for translation.",
      required: true,
    }),
    force: Flags.boolean({
      description: "Force overwrite of existing translations.",
      default: false,
    }),
    namespace: Flags.string({
      description:
        "Limit translation to a specific namespace (e.g., widget, form)",
      required: false,
    }),
    "dry-run": Flags.boolean({
      description: "Perform a dry run without saving changes",
      default: false,
    }),
  };

  async LLMtranslate(text, from, to) {
    const accountId = process.env.CF_ACCOUNT;
    const authToken = process.env.CF_TOKEN;

    if (!accountId || !authToken) {
      this.error(
        "Both CF_ACCOUNT and CF_TOKEN environment variables must be set.",
      );
    }

    // Using Llama-2, a general purpose LLM, with a system prompt for translation.
    const model = "@cf/meta/llama-2-7b-chat-int8";
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

    this.log(`Translating via Cloudflare LLM...`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Your task is to accurately translate the user's text from ${from} to ${to}, preserving the original meaning and tone, without shortening it. Do not add any extra conversational text or apologies, return ONLY the translated text, without any additional introduction or explanation.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.error(
        `API call failed with status ${response.status}: ${errorText}`,
      );
    }

    const result = await response.json();
    // Trim potential quotes or extra text from the LLM response
    return result.result.response.trim().replace(/^"|"$/g, "");
  }

  async translate(text, from, to) {
    const accountId = process.env.CF_ACCOUNT;
    const authToken = process.env.CF_TOKEN;

    if (!accountId || !authToken) {
      this.error(
        "Both CF_ACCOUNT and CF_TOKEN environment variables must be set.",
      );
    }

    const model = "@cf/meta/m2m100-1.2b";
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        source_lang: from,
        target_lang: to,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.error(
        `API call failed with status ${response.status}: ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("-> ", text, result.result.translated_text);
    return result.result.translated_text;
  }

  // Helper to get a nested value from an object based on a path array.
  getValue(obj, keyPath) {
    return keyPath.reduce((curr, key) => curr && curr[key], obj);
  }

  // Helper to set a nested value in an object based on a path array.
  setValue(obj, keyPath, value) {
    let current = obj;
    for (let i = 0; i < keyPath.length - 1; i++) {
      const key = keyPath[i];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }
    current[keyPath[keyPath.length - 1]] = value;
  }

  async traverseAndTranslate(source, target, { from, to, force, path = [] }) {
    for (const key of Object.keys(source)) {
      const currentPath = [...path, key];
      const sourceValue = source[key];

      if (typeof sourceValue === "string" && sourceValue.trim() !== "") {
        const targetValue = this.getValue(target, [key]);

        if (targetValue && !force) {
          this.log(`Skipping (already exists): ${currentPath.join(".")}`);
          continue;
        }

        try {
          let translatedText;

          if (sourceValue.startsWith("- ")) {
            const lines = sourceValue
              .slice(2)
              .split("\n- ")
              .filter((l) => l.trim() !== "");

            this.log(`Translating markdown list: ${currentPath.join(".")}`);
            const translatedLines = await Promise.all(
              lines.map(async (line) => {
                const content = line.trim();
                if (this.dryRun) {
                  console.log("skip translation ", content);
                  return "- " + content;
                }
                const translatedContent = await this.translate(
                  content,
                  from,
                  to,
                );
                return `- ${translatedContent}`;
              }),
            );
            translatedText = translatedLines.join("\n");
          } else {
            translatedText = await this.translate(sourceValue.trim(), from, to);
          }

          this.setValue(target, [key], translatedText);
          this.log(`OK: ${currentPath.join(".")}`);
        } catch (error) {
          this.error(
            `Error translating ${currentPath.join(".")}: ${error.message}`,
          );
        }
      } else if (typeof sourceValue === "object" && sourceValue !== null) {
        if (!this.getValue(target, [key])) {
          this.setValue(target, [key], {});
        }
        await this.traverseAndTranslate(
          sourceValue,
          this.getValue(target, [key]),
          { from, to, force, path: currentPath },
        );
      } else if (sourceValue.trim() === "") {
        this.log(`Skipping (empty string): ${currentPath.join(".")}`);
      }
    }
  }

  async run() {
    const { flags } = await this.parse(CampaignTranslate);
    const { campaign, from, to, force } = flags;
    this.dryRun = flags['dry-run'];

    const filePath = path.join(
      process.cwd(),
      "config/campaign",
      `${campaign}.json`,
    );

    try {
      const fileContent = await readFile(filePath, "utf-8");
      const data = JSON.parse(fileContent);

      let sourceLocaleRoot = data.config?.locales?.[from];
      if (!sourceLocaleRoot) {
        this.error(`Source locale "${from}" not found in ${filePath}`);
      }

      if (!data.config.locales[to]) {
        data.config.locales[to] = {};
      }
      let targetLocaleRoot = data.config.locales[to];

      let sourceLocale, targetLocale;

      this.log(
        `Translating campaign '${campaign}' from '${from}' to '${to}'...`,
      );

      if (flags.namespace) {
        const namespace = flags.namespace + ":";
        this.log(`Restricting to namespace: ${namespace}`);
        sourceLocale = this.getValue(sourceLocaleRoot, [namespace]);
        if (!sourceLocale) {
          this.error(
            `Namespace "${namespace}" not found in source locale "${from}"`,
          );
        }

        if (!this.getValue(targetLocaleRoot, [namespace])) {
          this.setValue(targetLocaleRoot, [namespace], {});
        }
        targetLocale = this.getValue(targetLocaleRoot, [namespace]);
      } else {
        sourceLocale = sourceLocaleRoot;
        targetLocale = targetLocaleRoot;
      }

      if (force) {
        this.log("Force mode enabled: overwriting existing translations.");
      }

      await this.traverseAndTranslate(sourceLocale, targetLocale, {
        from,
        to,
        force,
      });

                if (this.dryRun) {
        this.log("\nDry run enabled. Skipping file save.");
      } else {
        await writeFile(filePath, JSON.stringify(data, null, 2));
        this.log(`\nTranslation complete. File saved: ${filePath}`);
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        this.error(`File not found: ${filePath}`);
      }
      this.error(error.message);
    }
  }
}
