import { serve } from "../../esbuild.js";

import { Command, Args, Flags } from "proca/src/procaCommand.mjs";

export default class ServeCommand extends Command {
  static description = "preview the widget";

  static args = this.multiid();

  static flags = {
    //...super.globalFlags,
    ...this.flagify({ multiid: true }),
  };

  async run() {
    const { flags } = await this.parse();
    this.log("serve", flags.id);
    await serve(flags.id);
  }
}
