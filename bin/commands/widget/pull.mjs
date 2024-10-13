import {serve} from '../../esbuild.js';
import { pull } from '../../widget.js';

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
    }),
    campaign: Flags.boolean({ 
      default: true,
      allowNo: true,
    })
  }; 

  async run() {
   const { flags } = await this.parse();
   const r = await pull (flags.id, { anonymous : false, campaign : flags.campaign});
   if (r.errors) {
console.log("errors",r.errors);
     this.error (r.errors);
   }
   const widget = r[0];
   this.log(widget.actionpage,widget.lang,widget.filename,widget.org.name);
   this.info("pulled widget",'config/'+widget.actionpage +".json");

  }
}
