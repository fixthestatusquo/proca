const getData = (key, selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset[key];
};

const getOverwriteLocales = (
  allowed = "sign-now,register,share_title,share_intro,consent_intro,consent_opt-in,consent_opt-in,email_subject,email_body,twitter_actionText"
) => {
  allowed = allowed.split(",");
  const converting = { "sign-now": "Sign now!" }; // dealing with keys that aren't classes
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
          if (converting[c]) locales[converting[c]] = t.textContent;
        }
      }
    }
  }
  return locales;
};

const getAllData = (
  selector,
  allowed = "share,share-twitter,share-whatsapp,share-telegram,share-linkedin,share-subject,share-body,dialog-title,firstname,lastname,email,phone,postcode,country,comment"
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
