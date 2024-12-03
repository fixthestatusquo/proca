import ProcaCommand from "proca/src/procaCommand.mjs";
import { load as loadConfig } from "proca/src/config.mjs";
import path from 'path';
import { fileURLToPath } from 'url';

export class BuilderCommand extends ProcaCommand {

	static multiid() {
    return ProcaCommand.multiid ();
	}

  static flagify (params = {}) {
    return ProcaCommand.flagify (params);
  }

	async init() {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const defaultConfigDir = path.resolve(dirname, '../config');
		await super.init();

		const userConfig = loadConfig(this.config.configDir);
    
    this.config.dataDir = userConfig?.REACT_APP_CONFIG_FOLDER || defaultConfigDir;

	}

}

export default BuilderCommand;
