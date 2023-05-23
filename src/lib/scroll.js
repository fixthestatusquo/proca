const scrollTo = (dom) => {
  let delay = 0;
  if (typeof dom === "object") {
    delay = dom.delay || 0;
    dom = dom.selector;
  }

  setTimeout(() => {
    const widget = document.querySelector(dom || ".proca-widget");
    if (!widget) return;
    widget.scrollIntoView({ block: dom.block || "center", behavior: "smooth" });
  }, delay);
};

export { scrollTo };
