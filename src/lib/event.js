const dispatch = (event, data) => {
  console.log(event, data);
  const elem = document.getElementById("proca");
  if (!elem) {
    console.error("#proca missing");
    return;
  }
  const e = new CustomEvent(event, { detail: data });
  elem.dispatchEvent(e);
};

export default dispatch;

export { dispatch };
