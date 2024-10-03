#!/usr/bin/env babel-node
// it en bg cs da de el es et fi fr ga hu lt lv mt nl pl pt ro sk sl sv hr
const fs = require("fs");
const { file } = require("./config.js");

const readEci = eci => {
  try {
    return JSON.parse(fs.readFileSync(file(eci), "utf8")).initiative;
  } catch (e) {
    console.error("no local copy of the eci " + file(eci), e.message);
    return null;
  }
};

const eci = readEci("REQ.ECI(2020)000005");
let lang = [];
eci.languages.language.forEach(d => {
  lang.push(d.code);
});
console.log(lang.join(" "));
