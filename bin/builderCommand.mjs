import ProcaCommand from "proca/src/procaCommand.mjs";
//import { load as loadConfig } from "proca/src/config.mjs";
import path from "path";
import { fileURLToPath } from "url";
export { Args, Flags } from "proca/src/index.mjs";
export class BuilderCommand extends ProcaCommand {
  static multiid() {
    return ProcaCommand.multiid();
  }

  static flagify(params = {}) {
    return ProcaCommand.flagify(params);
  }

  async init() {
    await super.init();
//    const dirname = path.dirname(fileURLToPath(import.meta.url));
//    const defaultConfigDir = path.resolve(dirname, "../config");

//    const userConfig = loadConfig(this.config.configDir);
//console.log(this.config);
//    this.config.dataDir =
  }

}

export default BuilderCommand;
