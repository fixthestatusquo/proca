import Command, { Args, Flags } from "../../builderCommand.mjs";

export default class GitStatus extends Command {
  async run() {
    const { flags } = await this.parse();
    const { status } = await import("../../git.js");
      const r = await status();
      return status;
    }
}
