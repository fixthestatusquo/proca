import Command, { Args, Flags } from "../../builderCommand.mjs";
import { getCampaign } from "proca/src/commands/campaign/get.mjs";

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

  gitMessage = campaign =>
    `#${campaign.id} for ${campaign.org.name} ${campaign.title}\n${campaign.org.title}`;

  pull = async name => {
    const campaign = await getCampaign({ name });
    const r = await this.save(campaign);
    return { file: this.fileName, ...campaign, ...r };
  };

  async run() {
    const { flags } = await this.parse();
    if (flags.id) this.error("not implemented yet");
    //    const { pullCampaign: pull } = await import("../../campaign.js");
    const r = await this.pull(flags.name);
    this.output(r);
  }
}
