import { pull } from "../../widget.js";

import Command, { Args, Flags } from "../../builderCommand.mjs";

export default class FetchCommand extends Command {
  static description = "pull the widget (and campaign) configuration from the server";

  static examples = ["<%= config.bin %> <%= command.id %> -o <organisation>"];

  static args = Command.multiid();

  static flags = {
    // flag with no value (-f, --force)
    ...Command.flagify({ multiid: true }),
    //    ...super.globalFlags,
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

  async run() {
    const { flags } = await this.parse();
    const r = await pull(flags.id, {
      anonymous: false,
      campaign: flags.campaign,
    });
    if (r.errors) {
      console.log("errors", r.errors);
      this.error(r.errors);
    }
    const [widget, campaign] = r;
    this.log(widget.actionpage, widget.lang, widget.filename, widget.org.name);
    this.info("pulled widget config/" + widget.actionpage + ".json");
    this.info("pulled campaign config/campaign/" + campaign.name + ".json");
  }
}
