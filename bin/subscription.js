#!/usr/bin/env node
const withAbsintheSocket = require("@absinthe/socket");
const { Socket } = require("phoenix");
const ws = require("websocket").w3cwebsocket;
const { build } = require("./esbuild");
require("./dotenv.js");

const api = process.env.REACT_APP_API_URL || "https://api.proca.app/api";
const socket = api.replace(/api$/, "socket").replace(/^http/, "ws");

console.log(api, socket);

const logEvent =
  (eventName) =>
  (...args) =>
    console.log(eventName, ...args);

const absintheSocket = withAbsintheSocket.create(
  new Socket(socket, { transport: ws })
);

const operation = `subscription news {
  actionPageUpserted {
       id, name
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
    console.log("waiting for widgets to build");
  },
  onResult: (data) => {
    const id = data.data.actionPageUpserted.id;
    build(id);
    //console.log(data)
  },
});
