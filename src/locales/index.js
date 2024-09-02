const { readdirSync, readFileSync, writeFileSync } = require("fs");

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const aggregate = (nameSpace = "common") => {
  const d = {};
  const allLang = getDirectories(__dirname);
  allLang.map((lang) => {
    try {
      const content = readFileSync(
        `${__dirname}/${lang}/${nameSpace}.json`,
        "utf8"
      );
      d[lang] = JSON.parse(content);
    } catch (e) {
      if (e.code !== "ENOENT") {
        throw e;
      }
    }
  });
  writeFileSync(
    `${__dirname}/${nameSpace}.json`,
    JSON.stringify(d, null, 2),
    "utf8"
  );
};

aggregate();
aggregate("eci");
