const dispatch = (event, data, pii) => {
  const elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
    return;
  }
  if (pii) data.contact = pii; //TODO, add a config to remove the option to bubble up pii to the containing page
  const e = new CustomEvent(event, { detail: data });
  elem.dispatchEvent(e);
};

export default dispatch;

export { dispatch };
