#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("./dotenv.js");
const argv = require("minimist")(process.argv.slice(2));

const createClient = require("@supabase/supabase-js").createClient;
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey || supabaseAnonKey
);

const imageType = (name) => {
  const imageTypes = {
    ".jpg.jpeg": "image/jpeg",
    ".png": "image/png",
  };
  const ext = path.extname(name);
  const t = Object.keys(imageTypes).find((t) => t.includes(ext));
  return imageTypes[t];
};
const slugify = (text) =>
  text
    .replace(/[^a-z\.0-9 _-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .toLowerCase();

const url = (fileName) =>
  supabaseUrl +
  "/storage/v1/object/public/together4forests/template/" +
  fileName;

const push = async (name) => {
  const file = fs.readFileSync(name);
  const key = slugify(path.basename(name, path.extname(name)));
  const fileName = key + path.extname(name);
  const type = imageType(name);

  const r = await supabase.storage
    .from("together4forests")
    .upload("template/" + fileName, file, {
      contentType: type,
      cacheControl: "3600",
      upsert: argv.upsert,
    });
  if (r.error) {
    if (r.error.statusCode === "23505") {
      console.warn("already uploaded, --upsert if you want to force upload");
    } else {
      console.error(r.error);
      process.exit(1);
    }
  }
  console.log(url(fileName));
  let d = {
    lang: "",
    image: url(fileName),
    enabled: true,
    top_text: key + ".top",
    bottom_text: key + ".bottom",
  };
  d.hash = hash(d);
  const { data, error } = await supabase.from("meme_template").insert([d]);

  if (error) {
    if (error.code === "23505") {
      console.warn(
        "template already created, --upsert if you want to force upload"
      );
    } else {
      console.error("error", error);
      process.exit(1);
    }
  }
  return fileName;
};

const help = () => {
  console.log(
    [
      "options",
      "--help (this command)",
      "--upsert (force replace)",
      "{image file}.jpg upload the image as a meme template",
      //      "boolean inputs, no validatiton, everything but 'false' will be set to 'true'"
    ].join("\n")
  );
  process.exit(0);
};

const hash = (obj) => {
  const al = "image,top_text,bottom_text".split(",");
  const payload = Object.keys(obj)
    .filter((k) => al.includes(k))
    .reduce((r, k) => {
      r[k] = obj[k];
      return r;
    }, {});
  const m = JSON.stringify(payload, Object.keys(payload).sort());
  const hash = crypto.createHash("sha256").update(m).digest("base64url");
  return hash;
};

(async function () {
  const name = argv._[0];
  console.log(name);
  if (!name) {
    console.error("missing option of image to upload");
    help();
    process.exit(1);
  }
  const image = await push(name);
})();
