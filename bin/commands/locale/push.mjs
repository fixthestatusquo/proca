import Command, { Flags } from "./cache.mjs";
export default class GitPush extends Command {
  static description = "git push of the config folder to the remote main";

  static hidden = false;

  static flags = {};

  async run() {
    const result = await this.push();
    return this.output(result);
  }
}
