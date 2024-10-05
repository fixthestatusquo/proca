const scrollTo = params => {
  const {
    delay = 100,
    block = "center",
    selector = ".proca-widget",
  } = params || {};
  setTimeout(() => {
    const widget = document.querySelector(selector);
    if (!widget) return;
    widget.scrollIntoView({ block: block, behavior: "smooth" });
    if (params.focus) {
      const field = document.getElementsByName(params.focus);
      if (field.length === 1) {
        setTimeout(() => {
          field[0].focus();
        }, 1000);
      }
    }
  }, delay);
};

export { scrollTo };
