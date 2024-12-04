import {serve} from '../../esbuild.js';
import { Args, Flags } from "@oclif/core";

import Command from 'proca/src/procaCommand.mjs';

export default class ServeCommand extends Command {
  static description = "preview the widget"; 
 
	static args = this.multiid();

	static flags = {
    //...super.globalFlags, 
		...this.flagify({ multiid: true }),
    id: Flags.string({ 
      char: "i",
      parse: (input) => Number.parseInt(input, 10),
      required: true,
    })
  }; 

  async run() {
   const { flags } = await this.parse();
    this.log('serve',flags.id);
    await serve (flags.id);
  }
}
