#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import path from "path";
import Command, { Flags } from "../../builderCommand.mjs";

export default class CampaignTranslate extends Command {
  static description =
    "Export a campaign's locale file";

  static flags = {
    campaign: Flags.string({
      char: "c",
      description: "Name of the campaign to translate.",
      required: true,
    }),
    lang: Flags.string({
      default: "en",
    }),
    namespace: Flags.string({
      description:
        "Limit translation to a specific namespace (e.g., common, letter, campaign)",
      required: false,
    }),
  };

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

  async traverse(source, target, { lang, path = [] }) {
    for (const key of Object.keys(source)) {
      const currentPath = [...path, key];
      const sourceValue = source[key];

      if (typeof sourceValue === "string" && sourceValue.trim() !== "") {
console.log("## " + currentPath);

            console.log(sourceValue.trim());
      } else if (typeof sourceValue === "object" && sourceValue !== null) {
        await this.traverse(
          sourceValue,
          this.getValue(target, [key]),
          { lang, path: currentPath },
        );
      } else if (sourceValue.trim() === "") {
      }
    }
  }

  async run() {
    const { flags } = await this.parse(CampaignTranslate);
    const { campaign, lang } = flags;
    this.dryRun = flags['dry-run'];

    const filePath = path.join(
      process.cwd(),
      "config/campaign",
      `${campaign}.json`,
    );

      const fileContent = await readFile(filePath, "utf-8");
      const data = JSON.parse(fileContent);

      let sourceLocaleRoot = data.config?.locales?.[lang];
      if (!sourceLocaleRoot) {
        this.error(`Source locale "${from}" not found in ${filePath}`);
      }


      let sourceLocale, targetLocale;


      if (flags.namespace) {
        const namespace = flags.namespace + ":";
        this.log(`Restricting to namespace: ${namespace}`);
        sourceLocale = this.getValue(sourceLocaleRoot, [namespace]);
        if (!sourceLocale) {
          this.error(
            `Namespace "${namespace}" not found in source locale "${from}"`,
          );
        }

      } else {
        sourceLocale = sourceLocaleRoot;
      }


      await this.traverse(sourceLocale, targetLocale, { lang
      });
  }
}
