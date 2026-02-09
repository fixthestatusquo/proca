import Command, { Flags } from "./cache.mjs";
export default class GitStatus extends Command {
  static description = "git status of the config folder";

  static hidden = false;

  static flags = {};

  async run() {
    const status = await this.status();
    return this.output(status);
  }
}
