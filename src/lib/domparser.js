const getData = (key,selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset[key];
}

const getAllData= (selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset;
};
export { getData, getAllData};
export default getData;
