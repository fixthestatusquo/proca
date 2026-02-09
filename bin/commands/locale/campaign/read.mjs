import Command, { Flags } from "../cache.mjs";

export default class CampaignRead extends Command {
  static description = "Reads a campaign configuration file";

  static args = Command.multiid();
  static aliases = ["campaign:read"];
  static hidden = false;

  static flags = {
    ...Command.flagify({ multiid: true, name: "campaign" }),
    config: Flags.boolean({
      description: "display the config",
      default: true,
      allowNo: true,
    }),
    locale: Flags.string({
      description: "display a locale",
    }),
  };

  simplify = d => {
    const result = {
      id: d.id,
      Name: d.name,
      Title: d.title,
      Org: d.org.name,
      locales: d.config.locales && Object.keys(d.config.locales).join(" "),
      journey: d.config.journey?.join(" → "),
    };
    return result;
  };

  table = r => {
    super.table(r, null, null);
    if (this.flags.locale) {
      this.prettyJson(r.config?.locales[this.flags.locale]);
    }
    if (this.flags.config) {
      r.config.locales = undefined;
      this.prettyJson(r.config);
    }
  };

  async run() {
    const { flags } = await this.parse(CampaignRead);

    const fileContent = await this.read(`campaign/${flags.name}`);

    return this.output(fileContent, { single: true });
  }
}
