const dispatchAnalytics = (message, value) => {
  console.log(message, value);
  let param = {
    event: "proca_" + message.replace(":", "_"),
  };
  const action = message.split(":");
  if (value?.test) {
    param.testMode = true;
  }
  if (value?.privacy) {
    param.gdpr = value.privacy;
  }
  if (action[1] && action[1] === "complete") {
    param.event = "proca_" + action[0];
  }
  window.dataLayer?.push(param);
};

const dispatch = (event, data, pii, config) => {
  let elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
    elem = window;
  }
  if (config?.component?.widget?.analytics) {
    dispatchAnalytics(event, data);
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

export default dispatch;

export { dispatch };
