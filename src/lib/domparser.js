
import lodash_set from "lodash/set";

const getData = (key, selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset[key];
};

const getOverwriteLocales = () => {
  const texts = document.getElementsByClassName("proca-text");
  let locales = {};
  for (const t of texts) {
    for (const c of t.classList) {
      if (c === "proca-text") continue;
      const key = c.replaceAll("_", ".")
      lodash_set(locales, key, t.textContent);
    }
  }
  return locales;
};

const getAllData = (selector) => {
  const dom = document.querySelector(selector);
  const texts = document.getElementsByClassName("proca-text");
  let variants = {};
  let locales = {};
  for (const t of texts) {
    for (const c of t.classList) {
      if (c === "proca-text") continue;
      if (locales[c]) {
        // we have multiple variants for the same text
        if (!variants[c]) {
          variants[c] = [locales[c]];
        }
        variants[c].push(t.textContent);
      } else {
        locales[c] = t.textContent;
      }
    }
  }
  for (const [key, value] of Object.entries(variants)) {
    // if duplicate texts, we AB test it
    const chosen = Math.floor(Math.random() * (value.length + 1));
    locales[key] = value[chosen];
  }
  return { ...dom.dataset, locales: locales };
};
export { getData, getAllData, getOverwriteLocales };
export default getData;
