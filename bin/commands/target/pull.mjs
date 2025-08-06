
import Command, { Args, Flags } from "../../builderCommand.mjs";
import { pullTarget } from "../../target.js";
console.log("aaa", pullTarget);
export default class extends Command {
  static description = "pull the target configuration from the server";

  static examples = ["<%= config.bin %> <%= command.id %> -o <organisation>"];

  static args = Command.multiid();

  static flags = {
    ...Command.flagify({ multiid: true }),
    git: Flags.boolean({
      default: true,
      description: "commit the changes to git",
      allowNo: true,
    }),
    source: Flags.boolean({
      default: true,
      description: "filter the server list to only keep the targets in the source",
      allowNo: true,
    }),
    file: Flags.string({
      description: "filename to read from",
    })
  };

  async run() {
    const { flags, argv } = await this.parse();
    const name = argv[0];
    const r = await pullTarget(name, { ...flags, ...argv });
    if (r.errors) {
      console.log("errors", r.errors);
      this.error(r.errors);
    }
  }
}
