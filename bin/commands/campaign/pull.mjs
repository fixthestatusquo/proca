import Command, { Args, Flags } from "../../builderCommand.mjs";

export default class CampaignPush extends Command {
  static description = "pull the campaign from the server to the config file";

  static args = this.multiid();

  static flags = {
    //...super.globalFlags,
    ...this.flagify({ multiid: true }),
    name: Flags.string({
      char: "n",
    }),
    git: Flags.boolean({
      default: true,
      description: "commit the changes to git",
      allowNo: true,
    }),
  };

  async run() {
    const { flags } = await this.parse();
    if (flags.campaign) this.error("not implemented yet");
    const { pullCampaign : pull } = await import("../../campaign.js");
    const r = await pull(flags.name);
    if (r.errors) {
      console.log("errors", r.errors);
      this.error(r.errors);
    }
    //console.log(r);
  }
}
