const dispatch = (event, data, pii) => {
  let elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
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

export default dispatch;

export { dispatch };
