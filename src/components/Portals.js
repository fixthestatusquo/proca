import React from "react";
import ReactDOM from "react-dom";

import { portals } from "../actionPage";

const Portalify = (props) => {
  let r = [];
  const Portal = portals[props.component];
  if (props.create === "prepend") {
    //if props.append?
    //    node.append(...nodes or strings) – append nodes or strings at the end of node,
    //node.prepend(...nodes or strings) – insert nodes or strings at the beginning of node,
    //node.before(...nodes or strings) –- insert nodes or strings before node,
    //node.after(...nodes or strings) –- insert nodes or strings after node,
    //node.replaceWith(...nodes or strings) –
    //document.query
    console.log("todo");
  }

  document.querySelectorAll(props.selector).forEach((dom, i) => {
    r.push(
      ReactDOM.createPortal(<Portal {...props} key={props.selector + i} />, dom)
    );
    dom.innerHTML = "";
  });

  props.dom &&
    props.dom.querySelectorAll(props.selector).forEach((dom, i) => {
      r.push(
        ReactDOM.createPortal(
          <Portal {...props} key={props.selector + i} />,
          dom
        )
      );
      dom.innerHTML = "";
    });

  return r;
};

const Portals = (props) => {
  let r = [];
  props.portals &&
    props.portals.forEach((p, i) => {
      if (typeof p === "string") {
        r.push(React.createElement(portals[p], { name: p, key: "portal" + i }));
      } else r.push(<Portalify {...p} dom={props.dom} key={"portal" + i} />);
    });
  return r;
  //  return <Portalify selector='.eci-title' component='eci_Display'/>;
};

export default Portals;
