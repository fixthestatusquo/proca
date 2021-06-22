import React, {useEffect} from "react";
import {RecoilRoot, useRecoilSnapshot} from 'recoil';
import ProcaStyle from "./ProcaStyle.js";
import {ConfigProvider} from "../hooks/useConfig";

export default function Container (props) {
  const go = props.go || (action => console.log("go,action"));
  const actions  = props.actions || {} ;

  const config = props.config || {
//    data: Url.data(),
//    utm: Url.utm(),
    hook: {},
    param: {}
  };

  return (
        <RecoilRoot>
          <DebugObserver />
        <ConfigProvider go={go} actions={actions} config={config}>
          <ProcaStyle>

        {props.children}
          </ProcaStyle>
        </ConfigProvider>
        </RecoilRoot>

      )


  function DebugObserver() {
  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    console.debug('The following atoms were modified:');
    for (const node of snapshot.getNodes_UNSTABLE({isModified: true})) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  }, [snapshot]);

  return null;
}
};


