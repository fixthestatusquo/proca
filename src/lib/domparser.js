const getData = (key,selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset[key];
}

export { getData};
export default getData;
