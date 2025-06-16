import Events from "./observer";

const domObserver = (event, data, pii) => {
  let elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
    //    dispatchAnalytics("error", "missing #proca");
    elem = window;
  }
  if (pii) data.contact = pii; //TODO, add a config to remove the option to bubble up pii to the containing page
  const e = new CustomEvent(event, {
    detail: data,
    bubbles: true,
    cancelable: true,
  });
  elem.dispatchEvent(e);
  elem.dispatchEvent(
    new CustomEvent("proca", {
      bubbles: true,
      detail: { message: event.replace("proca:", ""), value: data },
    })
  ); //
};

const dataLayerObserver = (event, data, _pii) => {
//  console.log("GA4 received event:", event, data, pii);

  if (event === "count") return;
  const action = event.split(":");
  const param = Object.assign({}, data);
  "uuid,firstname,lastname,country,comment,subject,message,email,emailProvider,contact"
    .split(",")
    .forEach(attr => {
      if (Object.hasOwn(param, attr)) {
        delete param[attr];
      }
    });
  if (action[1] && action[1] === "complete") {
    param.event = action[0];
  } else {
    param.event = action.join("_");
  }
  param.source = "proca";
  if (data?.test) {
    param.test = true;
    console.log("GA4", param);
  }
  window.dataLayer && window.dataLayer.push && window.dataLayer.push(param);
};

const dispatch = (event, data, pii) => {
  Events.notify(event, data, pii);
};

Events.subscribe(domObserver);

if (window.dataLayer) {
  Events.subscribe(dataLayerObserver);
} else {
  //might need to wait until it loads
  setTimeout(() => {
    if (window.dataLayer) {
      Events.subscribe(dataLayerObserver);
    }
  }, 0);
}

const unsubscribeDataLayer = () => {
  setTimeout(() => {
    Events.unsubscribe(dataLayerObserver);
  },0);
};

export default dispatch;

export { dispatch, unsubscribeDataLayer };
