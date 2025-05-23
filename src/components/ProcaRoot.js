import React from "react";
import ProcaStyle from "@components/ProcaStyle.js";
import { ConfigProvider } from "@hooks/useConfig";

export default function Container(props) {
  const go = props.go || (() => console.log("go,action"));
  const actions = props.actions || {};

  const config = props.config || {
    //    data: Url.data(),
    //    utm: Url.utm(),
    hook: {},
    param: {},
  };

  return (
    <ConfigProvider go={go} actions={actions} config={config}>
      <ProcaStyle>{props.children}</ProcaStyle>
    </ConfigProvider>
  );
}
