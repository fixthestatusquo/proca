import Command, { Args, Flags } from "../../builderCommand.mjs";
import { digestTarget } from "../../target.js";

export default class extends Command {
  static description = "digest the target source file";

  static examples = ["<%= config.bin %> <%= command.id %> -o <organisation>"];

  static args = Command.multiid();

  static flags = {
    ...Command.flagify({ multiid: true }),
    git: Flags.boolean({
      default: true,
      description: "commit the changes to git",
      allowNo: true,
    }),
    file: Flags.string({
      description: "filename to read from",
    })
  };

  async run() {
    const { flags, argv } = await this.parse();
    const name = argv[0];
    const r = await digestTarget(name, { ...flags, ...argv });
    if (r.errors) {
      console.log("errors", r.errors);
      this.error(r.errors);
    }
  }
}
