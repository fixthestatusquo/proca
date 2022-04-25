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

export { pickOne };
