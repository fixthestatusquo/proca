// TODO: allow to set parameters about what region/bloc to fetch + what to filter out based on the population size
"use strict";
const https = require("https");
const fs = require("fs");

const url = "https://restcountries.eu/rest/v2/regionalbloc/eu";
const file = "./src/data/countries.json";
https.get(url, (res) => {
  res.setEncoding("utf8");
  let body = "";
  res.on("data", (data) => {
    body += data;
  });
  res.on("end", () => {
    body = JSON.parse(body);
    let countries = [];
    body.map((d) => {
      if (d.population < 400000) return; // remove dependencies and tiny ones
      //      countries.push({iso:d.alpha2Code,name:d.translations.fr});
      countries.push({ iso: d.alpha2Code, name: d.name });
    });
    fs.writeFileSync(file, JSON.stringify(countries, null, 2));
    console.log(countries);
  });
});
