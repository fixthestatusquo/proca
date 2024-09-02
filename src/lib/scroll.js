const scrollTo = (params) => {
  const {
    delay = 100,
    block = "center",
    selector = ".proca-widget",
  } = params || {};
  setTimeout(() => {
    const widget = document.querySelector(selector);
    if (!widget) return;
    widget.scrollIntoView({ block: block, behavior: "smooth" });
  }, delay);
};

export { scrollTo };
