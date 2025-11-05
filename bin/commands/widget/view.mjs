import { Command, Args, Flags } from "proca/src/procaCommand.mjs";

export default class ServeCommand extends Command {
  static description = "view the widget";

  static args = this.multiid();

  static flags = {
    //...super.globalFlags,
    ...this.flagify({ multiid: true }),
    preview: Flags.boolean({
      default: false,
      description: "view the preview widget instead of the live version",
      allowNo: false,
    }),
  };

  async run() {
    const { flags } = await this.parse();
    const { read } = await import("../../config.js");
    const config= await read(flags.id);
    const url = { privacy: config.org.privacyPolicy, home: config.org.url, preview: 'https://widget.proca.app/d/'+ config.filename +'/index.html' , live : config.location};
    const open = await import("open");
    if (flags.preview) {
     open.default(url.preview);
    } else {
     open.default(url.live || url.preview);
    }
    return this.output(url);
  }
}
