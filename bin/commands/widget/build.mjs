import Command, { Args, Flags } from "proca/src/procaCommand.mjs";

export default class ServeCommand extends Command {
  static description = "build the widget";

  static args = this.multiid();

  static flags = {
    ...this.flagify({ multiid: true }),
  };

  async run() {
    const { flags } = await this.parse();
    this.log("build ...", flags.id);
    const { build } = await import("../../esbuild.js");
    await build(flags.id);
  }
}
