import React from "react";
import ReactDOM from "react-dom";

import { portals } from "../actionPage";

const Portalify = props => {
  const r = [];

  const Portal = props => {
    // a portal that returns null doesn't overwrite the existing text
    const r = portals[props.component](props);
    if (r === null && props.original)
      return <div dangerouslySetInnerHTML={{ __html: props.original }} />;
    return r;
  };

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

  /*
  !props.dom && // does it happen?
  document.querySelectorAll(props.selector).forEach((dom, i) => {
    r.push(
      ReactDOM.createPortal(<Portal {...props} key={props.selector + i} original={dom.innerHTML}/>, dom)
    );
    dom.innerHTML = "";
  });
*/
  const dom = props.dom || document;
  let found = false;
  dom.querySelectorAll(props.selector).forEach((dom, i) => {
    found = true;
    r.push(
      ReactDOM.createPortal(
        <Portal {...props} key={props.selector + i} original={dom.innerHTML} 
         children={dom.innerHTML}
/>,
        dom
      )
    );
    dom.innerHTML = "";
  });

  !found &&
    document.querySelectorAll(props.selector).forEach((dom, i) => {
      r.push(
        ReactDOM.createPortal(
          <Portal
            {...props}
            key={props.selector + i}
            children={dom.innerHTML}
            original={dom.innerHTML}
          />,
          dom
        )
      );
      dom.innerHTML = "";
    });

  return r;
};

const Portals = props => {
  const r = [];
  props.portals &&
    props.portals.forEach((p, i) => {
      if (typeof p === "string") {
        r.push(React.createElement(portals[p], { name: p, key: `portal${i}` }));
      } else r.push(<Portalify {...p} dom={props.dom} key={`portal${i}`} />);
    });
  return r;
  //  return <Portalify selector='.eci-title' component='eci_Display'/>;
};

export default Portals;
