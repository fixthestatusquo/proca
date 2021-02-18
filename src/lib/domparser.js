const getData = (key, selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset[key];
};

const getOverwriteLocales = (allowed = "register,share_title,share_intro") => {
  allowed = allowed.split(",");
  const texts = document.getElementsByClassName("proca-text");
  let locales = {};
  for (const t of texts) {
    for (const c of t.classList) {
      if (c === "proca-text") continue;
      if (allowed.includes(c)) {
        const key = c.split("_");
        if (key.length > 1) {
          if (!locales[key[0]]) locales[key[0]] = {};
          locales[key[0]][key[1]] = t.textContent;
        } else {
          locales[c] = t.textContent;
        }
      }
    }
  }
  return locales;
};

const getAllData = (
  selector,
  allowed = "share,share-twitter,share-whatsapp,share-subject,share-body,dialog-title"
) => {
  allowed = allowed.split(",");
  const dom = document.querySelector(selector);
  const texts = document.getElementsByClassName("proca-text");
  let locales = {};
  for (const t of texts) {
    for (const c of t.classList) {
      if (c === "proca-text") continue;
      if (allowed.includes(c)) locales[c] = t.textContent;
    }
  }
  return { ...dom.dataset, locales: locales };
};
export { getData, getAllData, getOverwriteLocales };
export default getData;
