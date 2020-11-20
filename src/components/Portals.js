import React from "react";
import ReactDOM from "react-dom";

import { portals } from "../actionPage";

const Portalify = (props) => {
  let r = [];
  const Portal = portals[props.component];
  if (props.create === "prepend") {
    //document.query
    console.log("todo");
  }
  document.querySelectorAll(props.selector).forEach((dom, i) => {
    r.push(
      ReactDOM.createPortal(<Portal {...props} key={props.selector + i} />, dom)
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
      } else r.push(<Portalify {...p} key={"portal" + i} />);
    });
  return r;
  //  return <Portalify selector='.eci-title' component='eci_Display'/>;
};

export default Portals;
