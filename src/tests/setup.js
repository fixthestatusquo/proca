const globalSetup = async () => {
  require.resolve("../../webpack/rules"),
    require.resolve("../../webpack/alias"),
    require.resolve("../../webpack/output"),
    require.resolve("../../webpack/plugins"),
    require.resolve("../../webpack/actionPage.js");

  import donate_Amount from "./components/donate/Amount";
  import donate_Tab from "./components/donate/Tab";

  import apConfig from "@config/1.json";
  if (apConfig.actionpage && apConfig.template && apConfig.template == true) {
    apConfig.actionpage = null;
  }
  export const config = apConfig;
  export const steps = { donate_Amount, donate_Tab };

  export const portals = {};
};

export default globalSetup;
