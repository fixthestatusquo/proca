import ProcaCommand from "proca/src/gitCommand.mjs";
//import { load as loadConfig } from "proca/src/config.mjs";
export { Args, Flags } from "proca/src/index.mjs";

export class BuilderCommand extends ProcaCommand {
  fileName = undefined;
  newFile = undefined;

  static multiid() {
    return ProcaCommand.multiid();
  }

  static flagify(params = {}) {
    return ProcaCommand.flagify(params);
  }
}

export default BuilderCommand;
