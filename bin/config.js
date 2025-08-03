const fs = require("fs");
const path = require("path");
const color = require("cli-color");


const tmp = process.env.PROCA_CONFIG_FOLDER
  ?  process.env.PROCA_CONFIG_FOLDER  + "/"
  : path.resolve(__dirname, '../config') + "/" ;


const API_URL =
  process.env.API_URL ||
  process.env.REACT_APP_API_URL ||
  "https://api.proca.app/api";


const now = new Date();
const runDate = (date = now) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .replace("T", " ")
    .slice(0, -5);

const pathConfig = () => tmp;

const checked = (fileName) => {
  if (fileName.toString().includes("..")) {
    console.error("the filename is invalid ", fileName);
    throw new Error("invalid filename ", fileName);
  }
  return fileName;
};
// mkdir -p
const mkdirp = (pathToFile) => {
  if (!pathToFile) {
    console.log("need a path to folder to create");
    process.exit(1);
  }
  pathToFile = "config/" + pathToFile;
  fs.mkdirSync(pathToFile, { recursive: true });
};
const file = (id) => {
  return path.resolve(__dirname, tmp + checked(id) + ".json");
};

const fileExists = (id) => {
  return fs.existsSync(file(id));
};

const read = (id) => {
  try {
    return JSON.parse(fs.readFileSync(file(id), "utf8"));
  } catch (e) {
    console.error("no local copy of " + id, e.message);
    return null;
  }
};

const save = (config, suffix = "") => {
  const id = config.actionpage;
  //  console.log(file(id) + suffix);
  fs.writeFileSync(file(id) + suffix, JSON.stringify(config, null, 2));
  return file(id) + suffix;
};

const api = async (query, variables, name = "query", anonymous = false) => {
  let headers = anonymous ? {} : authHeader();
  headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: query,
        operationName: name,
        variables: variables,
      }),
      headers: headers,
    });

    if (res.status === 401) {
      console.error("permission error", API_URL);
      console.log(
        "check your setup, proca config server and proca config user",
      );
      throw new Error(res.statusText);
    }

    if (res.status === 404) {
      console.error("invalid api url");
      console.log("$proca config server #to check your config");
      throw new Error(res.statusText);
    }

    if (res.status >= 400) {
      console.log(res);
      throw new Error("Bad response from server");
    }
    const resJson = await res.json();

    if (resJson.errors) {
      resJson.errors.forEach((e) =>
        console.error(
          `${e.message}: ${e.path && e.path.join("->")} ${
            e.extensions ? JSON.stringify(e.extensions) : ""
          }`,
        ),
      );
      return resJson;
    }

    return resJson.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const authHeader = () => {
  let headers = {};
  if (process.env.PROCA_TOKEN) {
    headers = {
     authorization: 'Bearer ' + process.env.PROCA_TOKEN,
    };
  } else {
    if (!process.env.AUTH_USER || !process.env.AUTH_PASSWORD) {
      console.error(color.red("missing PROCA_TOKEN in your env"));
      return {};
      //      return link(API_URL);
    }
    console.warn(
      color.red(
        "remove AUTH_USER and AUTH_PASSWORD and put PROCA_TOKEN in your env",
      ),
      color.blue("\n$proca token |  sed 's/Bearer /PROCA_TOKEN=/' >> .env"),
    );
    process.exit(1);
  }
  return headers;
};


module.exports = {
  authHeader,
  pathConfig,
  api,
  API_URL,
  read,
  file,
  fileExists,
  save,
  checked,
  mkdirp,
  runDate,
  //  actionPageFromLocalConfig,
  //  pushCampaign,
  //  pullCampaign,
  //  saveCampaign,
  //addPage,
};
