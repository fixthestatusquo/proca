#!/usr/bin/env node
const withAbsintheSocket = require("@absinthe/socket");
const { Socket } = require("phoenix");
const ws = require("websocket").w3cwebsocket;
require("./dotenv.js");
const { build } = require("./esbuild");
const { getConfig } = require("./widget");
const { saveCampaign, pullCampaign } = require("./campaign");
const { runDate, save: saveWidget } = require("./config");

const api = process.env.REACT_APP_API_URL || "https://api.proca.app/api";
const socket = api.replace(/api$/, "socket").replace(/^http/, "ws");

const logEvent =
  (eventName) =>
  (...args) =>
    console.log(eventName, ...args);

const absintheSocket = withAbsintheSocket.create(
  new Socket(socket, { transport: ws })
);

const query = `subscription news {
  actionPageUpserted {
       id, name
  }
}`;

const operation = `subscription news {
  actionPageUpserted {
    id, name, locale,
    thankYouTemplate,
    ... on PrivateActionPage { supporterConfirmTemplate },
    campaign {
      id,
      title,name,config,
      org {name,title}
    },
    org {
      title,
      name,
      config,
      ... on PrivateOrg { processing { supporterConfirm, supporterConfirmTemplate }}
    }
    , config
  }
}`;

const notifier = withAbsintheSocket.send(absintheSocket, {
  operation,
  variables: {},
});

const updatedNotifier = withAbsintheSocket.observe(absintheSocket, notifier, {
  onAbort: logEvent("abort"),
  onError: logEvent("error"),
  onStart: (data) => {
    console.log("waiting for widgets to build", api);
  },
  onResult: async (d) => {
    const date = new Date();
    const data = d.data;
    data.actionPage = data.actionPageUpserted;
    delete data.actionPageUpserted;
    const config = getConfig(data);
    const campaignData = data.actionPage.campaign;
    saveWidget(config);
    saveCampaign(campaignData, config.lang);
    console.log(runDate(date), "widget", config.actionpage);
    await build(config.actionpage);
  },
});
