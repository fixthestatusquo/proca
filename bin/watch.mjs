#!/usr/bin/env node
import * as withAbsintheSocket from "@absinthe/socket";
import {Socket as PhoenixSocket} from "phoenix";

const absintheSocket = withAbsintheSocket.create(
  new PhoenixSocket("wss://api.proca.app/socket/websocket")
);

const query = `subscription news {
  actionPageUpserted {
       id, name
  }
}`;

(async () => {
  try {
  } catch (err) {
    console.log(err);
  }
})();
