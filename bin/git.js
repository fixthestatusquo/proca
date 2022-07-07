const path = require("path");
const simpleGit = require("simple-git");

const changeDir = () => {
  const current = path.resolve(__dirname);
  process.chdir(current + "/../config");
};

changeDir();
const git = simpleGit();

const status = async () => {
  const status = await git.status();
  /*
    not_added: [],
  conflicted: [],
  created: [],
  deleted: [],
  ignored: undefined,
  modified
  */
  "not_added,created,modified,deleted,conflicted".split(",").forEach((type) => {
    if (status[type].length) {
      status[type].forEach((file) => {
        console.log(type, "config/" + file);
      });
    }
  });
};

status();
