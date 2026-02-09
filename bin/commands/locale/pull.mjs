import Command, { Flags } from "./cache.mjs";
export default class GitPull extends Command {
  static description = "git pull of the config folder from the remote main";

  static hidden = false;

  static flags = {};

  async run() {
    const result = await this.pull();
    return this.output(result);
  }
}
