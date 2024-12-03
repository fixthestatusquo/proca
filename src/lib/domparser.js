const getData = (key, selector) => {
  const dom = document.querySelector(selector);
  return dom.dataset[key];
};

const getOverwriteLocales = (
  allowed = "sign-now,register,share_title,share_intro,consent_intro,consent_opt-in,consent_opt-out,consent_processing,email_subject,email_body,twitter_actionText,button,progress"
) => {
  allowed = allowed.split(",");
  const converting = {
    "sign-now": "Sign now!",
    button: "Sign now!",
    progress: "progress_plural",
  }; // dealing with keys that aren't classes

  const texts = document.getElementsByClassName("proca-text");
  const locales = {};
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
  allowed = "share,share-twitter,share-whatsapp,share-telegram,share-linkedin,share-subject,share-body,dialog-title,firstname,lastname,email,phone,postcode,country,comment,email-subject,email-body"
) => {
  allowed = allowed.split(",");
  const dom = document.querySelector(selector);
  const texts = document.getElementsByClassName("proca-text");
  const variants = {};
  const locales = {};
  for (const t of texts) {
    for (const c of t.classList) {
      if (c === "proca-text") continue;
      if (!allowed.includes(c)) continue;
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
