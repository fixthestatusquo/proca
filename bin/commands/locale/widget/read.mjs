import Command, { Flags } from "../cache.mjs";
import { getWidget } from "proca/src/commands/widget/get.mjs";
export default class WidgetRead extends Command {
  static description = "Reads a widget configuration file";

  static args = Command.multiid();
  static aliases = ["widget:read"];
  static hidden = false;

  static flags = {
    ...Command.flagify({ multiid: true, name: "widget" }),
    config: Flags.boolean({
      description: "display the config",
      default: true,
      allowNo: true,
    }),
  };

  simplify = d => {
    const result = {
      id: d.actionpage,
      Name: d.filename,
      Org: d.org.name,
      Campaign: d.campaign.name,
      location: d.location,
      Coordinator: d.lead.name !== d.org.name ? d.lead.name : undefined,
      lang: d.lang,
      journey: d.journey ?? d.journey?.join(" → "),
      primaryColor: d.layout?.primaryColor,
      component: Object(d.component).keys?.join(","),
      portal: d.portal?.join(","),
      extra: d.extraSupporters ?? d.extraSupporters,
    };
    return result;
  };

  table = r => {
    super.table(r, null, null);
    if (this.flags.config) {
      this.prettyJson({ component: r.component, portal: r.portal });
    }
  };

  async run() {
    const { flags } = await this.parse(WidgetRead);
    if (!flags.id) {
      const online = await getWidget(flags);
      flags.id = online.id;
    }
    const fileContent = await this.read(flags.id.toString());

    return this.output(fileContent);
  }
}
