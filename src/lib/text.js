const decodeHtmlEntities = (encodedString) => {
  const tempElement = document.createElement("textarea");
  tempElement.innerHTML = encodedString;
  return tempElement.value;
};

const homoSpacify = (text) => {
  // randomly replaces one of the space by a 'non standard' space
  //  const r =Array.from("\ufeff\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009");
  const r = Array.from("123456789");
  const pos = [];
  const asArray = Array.from(text);
  asArray.forEach((d, i) => {
    if (d === " ") pos.push(i);
  });
  const d = pos[Math.floor(Math.random() * pos.length)];
  const s = r[Math.floor(Math.random() * r.length)];
  asArray[d] = r[s];

  return asArray.join();
};

const slugify = (text, placeholder = "_") =>
  text
    .replace(/[^a-z0-9 _-]/g, "")
    .replace(/\s+/g, placeholder)
    .replace(/-+/g, placeholder)
    .toLowerCase();

const tokenize = (message, { profile, url }) => {
  let screen_name = "";
  let t = message;
  if (!profile) return message;
  if (Array.isArray(profile)) {
    const r = profile.map((d) =>
      d?.screen_name?.startsWith("@")
        ? d.screen_name.slice(1)
        : d?.screen_name || "",
    );
    screen_name = r.join(" @");
  } else {
    screen_name = profile.screen_name;
  }
  //    let t = typeof profile.actionText == "function" ? profile.actionText(profile): profile.actionText;

  if (!screen_name) return t;
  if (t.includes("{@}") || t.includes(screen_name)) {
    t = t.replace("{@}", `@${screen_name}`);
  } else {
    t = `.@${screen_name} ${t}`;
  }

  if (t.includes("{image}")) {
    t = t.replace(
      "{image}",
      profile.reduce((acc, d) => (d.image ? `${acc}\n${d.image}` : acc), ""),
    );
  }
  if (url) {
    if (t.includes("{url}")) {
      t = t.replace("{url}", url);
    } else {
      t = `${t}\n${url}`;
    }
  }
  return t;
};

const toArray = (locale) => {
  return locale
    .split("\n")
    .map((d) => d.trim())
    .filter((n) => n);
};

const toObject = (locale, separator) => {
  const result = {};
  const arr = toArray(locale);
  if (!separator) separator = "|";

  arr.forEach((d) => {
    const t = d.split(separator);
    if (t.length > 1) result[t[0].trim()] = t[1].trim();
    else {
      result[t[0].trim()] = t[0].trim();
    }
  });
  return result;
};

const pickOne = (locale) => {
  const text = locale;
  const v = toArray(text);

  let t = []; // use to stack the sentence(s) to be part of the current variant
  const variants = [];
  v.forEach((d) => {
    if (d.startsWith("- ")) {
      // new variant
      if (t.length) variants.push(t.join("\n"));
      t = [d.slice(2)];
    } else {
      t.push(d);
    }
  });
  variants.push(t.join("\n")); // add the last variant

  return variants[Math.floor(Math.random() * variants.length)];
};

const truncate = (text, nbParagraphs) => {
  const max = nbParagraphs || 3;
  const paragraphs = text.split("\n\n");
  if (paragraphs.length <= max) return text;
  return paragraphs.slice(0, max).join("\n\n");
};

export {
  toArray,
  toObject,
  pickOne,
  tokenize,
  slugify,
  homoSpacify,
  truncate,
  decodeHtmlEntities,
};
