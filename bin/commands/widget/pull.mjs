import Command, { Args, Flags } from "../../builderCommand.mjs";

export default class FetchCommand extends Command {
  static description = "pull the widget (and campaign) configuration from the server";

  static examples = ["<%= config.bin %> <%= command.id %> -o <organisation>"];

  static args = Command.multiid();

  static flags = {
    ...Command.flagify({ multiid: true }),
    campaign: Flags.boolean({
      default: true,
      allowNo: true,
    }),
    git: Flags.boolean({
      default: true,
      description: "commit the changes to git",
      allowNo: true,
    }),
  };

  async pull (id, flags = {}) {
    const { pull } = await import("../../widget.js");
    return await pull(id, {
      anonymous: false,
      campaign: flags.campaign,
      argv: flags
    });
  }

  async run() {
    const { flags } = await this.parse();
    const r = await this.pull (flags.id, flags);
    if (r.errors) {
      console.log("errors", r.errors);
      this.error(r.errors);
      return;
    }
    const [, campaign] = r;
    this.info("saved campaign "+process.env.PROCA_CONFIG_FOLDER+"/campaign/" + campaign.name + ".json");
  }
}
