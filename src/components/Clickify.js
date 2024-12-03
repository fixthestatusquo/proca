import { useEffect } from "react";
const Component = props => {
  //  config.component.widget?.mobileVersion;

  const click = props.done || props.click;
  const selector = props.watchSelector;
  useEffect(() => {
    const d = document.querySelectorAll(selector);
    d.forEach(e => {
      e.onclick = event => {
        event.preventDefault();
        window.proca.go(1);
        //click (e);
      };
    });
  }, [click, selector]);

  return null;
};

Component.defaultProps = {
  watchSelector: "[href='#proca-dialog'],.proca-button",
  click: () => alert("default action, needs to overwrite"),
};

export default Component;
