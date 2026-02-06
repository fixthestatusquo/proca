import Command from "proca/src/procaCommand.mjs";
import WidgetList from "proca/src/commands/widget/list.mjs";
import WidgetPull from "../../widget/pull.mjs";

export default class CampaignWidgetPull extends Command {
  static description = "pull all the widgets of a campaign";

  static examples = ["$ proca-cli campaign widget pull climate-action"];

  static args = this.multiid();

  static flags = {
    // flag with no value (-f, --force)
    ...this.flagify({ multiid: true }),
    //    dryRun: Flags.boolean({
    //      description: 'Show what would be rebuilt without actually doing it',
    //    }),
  };

  simplify = (d) => {
    return {id: d.actionpage, name: d.filename, org: d.org.name, lang:d.lang};
  };

  pull = async (props) => {
    const wapi = new WidgetList();
    const pullapi = new WidgetPull();
    wapi.flags.config = true; //we need to fetch each widget config
    const widgets = await wapi.fetchCampaign(props.name); //list all widgets
    const result = [];
    for (const widget of widgets) {
      // do not process all widgets in parallel but in sequence
      const r = await pullapi.pull(widget.id, {campaign:false});
      result.push(r[0]);
    }
    return result;
  };

  async run() {
    const { flags } = await this.parse();
    const r = await this.pull(flags);
    return this.output(r);
  }
}
