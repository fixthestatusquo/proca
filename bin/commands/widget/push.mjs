import { push } from '../../widget.js';

import { Args, Flags } from "@oclif/core";

import Command from '../../builderCommand.mjs';

export default class FetchCommand extends Command {
  static description = "preview the widget"; 
 
  static examples = ["<%= config.bin %> <%= command.id %> -o <organisation>"]; 
 
//	static args = this.multiid();

	static flags = {
    ...super.globalFlags, 
		//...this.flagify({ multiid: true }),
    id: Flags.string({ 
      char: "i",
      parse: (input) => Number.parseInt(input, 10),
      required: true,
      exactlyOne: ['id', 'campaign']
    }),
    campaign: Flags.string({ 
      char: "c",
      description: "push all the widgets of that campaign [WIP]",
    }),
    git: Flags.boolean({ 
      default: true,
      description:"commit the changes to git",
      allowNo: true,
    }),
  }; 

  async run() {
   const { flags } = await this.parse();
   if (flags.campaign) this.error ("not implemented yet");
   const r = await push (flags.id);
   if (r.errors) {
console.log("errors",r.errors);
     this.error (r.errors);
   }
   this.info ("pushed",r.name, r.locale);
//console.log(r);
  }
}
