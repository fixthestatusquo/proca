import { pushCampaign as push } from '../../campaign.js';

import { Args, Flags } from "@oclif/core";

import Command from '../../builderCommand.mjs';

export default class CampaignPush extends Command {
  static description = "push the campaign from the config file to the server"; 
 
  static flags = { 
    ...super.globalFlags, 
    name: Flags.string({ 
      char: "n",
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
   const r = await push (flags.name);
   if (r.errors) {
console.log("errors",r.errors);
     this.error (r.errors);
   }
   this.info ("pushed",r.name, r.locale);
//console.log(r);
  }
}
