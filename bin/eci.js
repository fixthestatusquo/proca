#!/usr/bin/env babel-node

const fs = require("fs");
const path = require("path");
const { pull, read, save, file } = require("./config.js");

const readEci = (eci) => {
  try {
    return JSON.parse(fs.readFileSync(file(eci), "utf8")).initiative;
  } catch (e) {
    console.error("no local copy of the eci " + file(eci), e.message);
    return null;
  }
};

const getLocale = (code, languages) => {
  const locale = languages.find((d) => d.code === code);
  console.log(locale);
  return locale;
};

(async () => {
  const argv = process.argv.slice(2);
  const id = parseInt(process.env.actionpage || argv[0]);
  if (!id) throw "need actionpage={id} or fetch {id}";
  try {
    //      const d = await pull(parseInt(id,10));
    const d = read(parseInt(id, 10));
    const eciid = d.component.eci.registrationNumber;
    const eci = readEci(eciid);
    d.component.eci.organisers = eci.organisers.organiser;
    d.component.eci.registrationDate = eci.registrationDate;
    d.locales["campaign:"] = getLocale(
      d.lang.toLowerCase(),
      eci.languages.language
    );
    console.log(d);
    save(d);
  } catch (e) {
    console.error(e);
    // Deal with the fact the chain failed
  }
})();
