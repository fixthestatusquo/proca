const scrollTo = (dom) => {
  let delay = 0;
  if (typeof dom === "object") {
    delay = dom.delay || 0;
    block = dom.block || "center";
    dom = dom.selector || ".proca-widget";
  }
  setTimeout(() => {
    const widget = document.querySelector(dom);
    if (!widget) return;
    widget.scrollIntoView({ block: block, behavior: "smooth" });
  }, delay);
};

export { scrollTo };
