const homoSpacify = text => { // randomly replaces one of the space by a 'non standard' space
//  const r =Array.from("\ufeff\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009");
  const r = Array.from("123456789");
  let pos = []; 
  let asArray = Array.from(text);
  asArray.forEach ( (d,i) => {
    if (d === ' ') pos.push (i);
  })
  let d = pos[Math.floor(Math.random()*pos.length)];
  let s = r[Math.floor(Math.random()*r.length)];
  asArray[d] = r[s];
  
  return asArray.join();
}


const slugify = (text) =>
  text
    .replace(/[^a-z0-9 _-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .toLowerCase();

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

  if (!screen_name) return t;
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

export { pickOne, tokenize, slugify, homoSpacify };
