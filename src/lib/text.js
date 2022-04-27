const tokenize = (message, { profile, url }) => {
  let screen_name = "";
  let t = message;
  if (!profile) return message;
  if (Array.isArray(profile)) {
    const r = profile.map((d) =>
      d.screen_name?.startsWith("@") ? d.screen_name.slice(1) : d.screen_name
    );
    screen_name = r.join(" @");
  } else {
    screen_name = profile.screen_name;
  }
  //    let t = typeof profile.actionText == "function" ? profile.actionText(profile): profile.actionText;

  if (t.indexOf("{@}") !== -1) t = t.replace("{@}", "@" + screen_name);
  else t = ".@" + screen_name + " " + t;

  if (url) {
    if (t.indexOf("{url}") !== -1) t = t.replace("{url}", url);
    else t = t + " " + url;
  }
  return t;
};

const pickOne = (locale) => {
  const text = locale;
  const v = text
    .split("\n")
    .map((d) => d.trim())
    .filter((n) => n);
  let t = []; // use to stack the sentence(s) to be part of the current variant
  let variants = [];
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

export { pickOne, tokenize };
