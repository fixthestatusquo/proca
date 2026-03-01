import Command, { Args, Flags } from "../../builderCommand.mjs";

export default class CampaignPush extends Command {
  static description =
    "generate a markdown based on the config file of the campaign";

  static args = this.multiid();

  static flags = {
    //...super.globalFlags,
    ...this.flagify({ multiid: true }),
    name: Flags.string({
      char: "n",
    }),
    lang: Flags.string({
      description: "language to display as markdown",
      default: "en",
    }),
  };

  jsonToMarkdown(locales) {
    const skipped = ["partner:", "onboarding"];

    let markdown = "";

    // Iterate through top-level keys (e.g., "campaign:")
    for (const level1Key in locales) {
      if (skipped.includes(level1Key)) continue;
      markdown += `# ${level1Key}\n\n`;

      const level1Obj = locales[level1Key];
      if (typeof level1Obj === "string") {
        markdown += `${level1Obj}\n\n`;
        continue;
      }
      // Iterate through second-level keys
      for (const level2Key in level1Obj) {
        markdown += `## ${level2Key}\n\n`;

        const level2Obj = level1Obj[level2Key];

        // If level2Obj is a string, just output it
        if (typeof level2Obj === "string") {
          markdown += `${level2Obj}\n\n`;
        } else if (typeof level2Obj === "object" && level2Obj !== null) {
          // Flatten from third level onwards
          function flattenAndFormat(obj, keyPath = "") {
            for (const key in obj) {
              const value = obj[key];
              const newPath = keyPath ? `${keyPath}.${key}` : key;

              if (
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
              ) {
                // Recursively flatten nested objects
                flattenAndFormat(value, newPath);
              } else {
                // Add markdown section at third level and below
                markdown += `### ${newPath}\n\n`;
                markdown += `${value}\n\n`;
              }
            }
          }

          flattenAndFormat(level2Obj);
        }
      }
    }
    return markdown;
  }

  async run() {
    const { flags } = await this.parse();
    const { readCampaign: read } = await import("../../campaign.js");
    const data = await read(flags.name);
    if (data.errors) {
      console.log("errors", data.errors);
      this.error(data.errors);
    }
    const locales = data.config.locales;
    if (!locales[flags.lang]) {
      throw new Error(`No locales ${flags.lang}`);
    }
    const result = this.jsonToMarkdown(locales[flags.lang]);
    console.log(result);
  }
}
