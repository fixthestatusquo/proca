
import Command, { Args, Flags } from "../../builderCommand.mjs";
import { publishTarget } from "../../publishTargets.js";

export default class extends Command {
  static description = "publish the target list to the public";

  static examples = ["<%= config.bin %> <%= command.id %> -o <organisation>"];

  static args = Command.multiid();

  static flags = {
    ...Command.flagify({ multiid: true }),
    git: Flags.boolean({
      default: true,
      description: "commit the changes to git",
      allowNo: true,
    }),
    email: Flags.boolean({
        description: "for campaigns sending client side",
        default: false
    }),
    display: Flags.boolean({
        description: "filters based on the display field",
        default: false
    }),
    source: Flags.boolean({
        description: "filter the server list based on source",
        default: true
    }),
    meps: Flags.boolean({
        description: "special formatting, done if 'epid' is a field",
        default: false
    }),
    external_id: Flags.boolean({
        description: "publishes the externalid",
        default: true
    }),
    fields: Flags.string({
        description: "add extra fields present in source, eg for custom filtering",
    }),
    salutation: Flags.boolean({
        description: "needs field/lang value",
        default: true
    })
  };

  async run() {
    const { flags, argv } = await this.parse();
    const name = argv[0];
    const r = await publishTarget(name, { ...flags, ...argv });
    if (r.errors) {
      console.log("errors", r.errors);
      this.error(r.errors);
    }
  }
}
