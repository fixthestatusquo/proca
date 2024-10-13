import {serve} from '../../esbuild.js';
import { Args, Flags } from "@oclif/core";

import Command from 'proca/src/procaCommand.mjs';

export default class ServeCommand extends Command {
  static description = "preview the widget"; 
 
  static examples = ["<%= config.bin %> <%= command.id %> -o <organisation>"]; 
 
  static flags = { 
    ...super.globalFlags, 
    id: Flags.string({ 
      char: "i",
      parse: (input) => Number.parseInt(input, 10),
      required: true,
    })
  }; 

  async run() {
console.log("start");
   const { flags } = await this.parse();
console.log("start 2");
    this.log('serve',flags.id);
console.log("start 3");
    await serve (flags.id);
  }
}
