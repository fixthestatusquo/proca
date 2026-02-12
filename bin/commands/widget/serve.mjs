import { Command, Args, Flags } from "proca/src/procaCommand.mjs";

export default class ServeCommand extends Command {
  static description = "serve the local version of the widget";

  static args = this.multiid();

  static flags = {
    ...this.flagify({ multiid: true }),
  };

  async run() {
    const { flags } = await this.parse();
    const { serve } = await import("../../esbuild.js");
    this.log("serve", flags.id);
    await serve(flags.id);
  }
}
