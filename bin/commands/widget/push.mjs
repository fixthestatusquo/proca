import Command, { Args, Flags } from "../../builderCommand.mjs";

export default class FetchCommand extends Command {
  static description =
    "push to the server the local configuration of the widget";

  static args = this.multiid();

  static flags = {
    ...this.flagify({ multiid: true }),
    git: Flags.boolean({
      default: true,
      description: "commit the changes to git",
      allowNo: true,
    }),
  };

  async run() {
    const { flags } = await this.parse();
    if (flags.campaign) this.error("not implemented yet");
    const { push } = await import("../../widget.js");
    const r = await push(flags.id);
    if (r.errors) {
      console.log("errors", r.errors);
      this.error(r.errors);
    }
    this.info("pushed", r.name, r.locale);
    //console.log(r);
  }
}
