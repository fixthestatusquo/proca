const getData = (key, selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset[key];
};

const getAllData = (selector) => {
  const allowed = "share,share-twitter,share-whatsapp,share-subject,share-body".split(
    ","
  );
  const dom = document.querySelector(selector);
  const texts = document.getElementsByClassName("proca-text");
  let locales = {};
  for (const t of texts) {
    for (const c of t.classList) {
      if (c === "proca-text") continue;
      if (allowed.includes(c)) locales[c] = t.textContent;
      else {
        console.log("not an allowed proca-text", c);
      }
    }
  }
  return { ...dom.dataset, locales: locales };
};
export { getData, getAllData };
export default getData;
