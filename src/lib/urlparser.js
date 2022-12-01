import Url from "url-parse";
/*
        var urlParams = new URLSearchParams(window.location.search);
        params.values = {};
        [
          "firstname",
          "lastname",
          "email",
          "postcode",
          "country",
          "comment"
        ].forEach(function(name) {
          if (urlParams.get(name)) params.values[name] = urlParams.get(name);
        });
        */

const filter = (query, whitelist = null, prefix = "") => {
  if (!whitelist) return query;
  let r = {};
  Object.keys(query)
    .filter(
      (key) =>
        key.startsWith(prefix) && whitelist.includes(key.substr(prefix.length))
    )
    .forEach((k) => (r[k.substr(prefix.length)] = query[k]));
  return r;
};

const parse = (whitelist, prefix) => {
  const url = Url(document.location, true);
  return filter(url.query, whitelist, prefix) || {};
};

const step = (prefix) => {
  const s = parse(["go"], prefix || "proca_");
  return s.go || null;
};

const data = (prefix) => {
  prefix = prefix || "proca_";
  const whitelist = [
    "amount",
    "paymentMethod",
    "firstname",
    "uuid",
    "lastname",
    "name",
    "email",
    "postcode",
    "address",
    "locality",
    "country",
    "comment",
    "frequency",
    "currency",
    "lang",
  ];
  return parse(whitelist, prefix);
};

const isTest = () => {
  const r = parse(["test"], "proca_");
  return "test" in r;
};

const config = (prefix) => {
  prefix = prefix || "proca_";
  const whitelist = ["comment"];
  return parse(whitelist, prefix);
};

const socialiseReferrer = (domain, utm) => {
  // this isn't exhaustive, nor meant to be
  if (domain.endsWith("facebook.com")) {
    utm.source = "social";
    utm.medium = "facebook";
    return true;
  }
  if (domain.includes("org.telegram.messenger")) {
    utm.source = "social";
    utm.medium = "telegram";
    return true;
  }

  if (domain === "twitter.com" || domain === "t.co") {
    utm.source = "social";
    utm.medium = "twitter";
    return true;
  }
  if (
    domain === "youtu.be" ||
    domain === "youtube.com" ||
    domain === "www.youtube.com"
  ) {
    utm.source = "social";
    utm.medium = "youtube";
    return true;
  }
  if (domain === "com.google.android.gm") {
    utm.source = "email";
    utm.medium = "gmail";
    return true;
  }
  if (domain === "www.google.com") {
    utm.source = "search";
    utm.medium = "google";
    return true;
  }
  if (domain === "l.instagram.com") {
    utm.source = "social";
    utm.medium = "instagram";
    return true;
  }
  if (domain === "outlook.live.com") {
    utm.source = "email";
    utm.medium = "outlook";
    return true;
  }

  return false;
};

const utm = (record = true) => {
  const whitelist = ["source", "medium", "campaign", "content"];
  if (record === false) {
    return {};
  }
  let utm = { source: "", medium: "", campaign: "" };
  let shortcut = parse(["utm"]).utm;
  if (shortcut) {
    // instead of having utm_xxx, we can have utm=campaign.source.medium
    const [campaign, source, medium] = shortcut.split(".");
    shortcut = { source, medium, campaign };
  }

  Object.assign(utm, shortcut, parse(whitelist, "utm_"));
  console.log(utm);
  if (!utm.source && document.referrer) {
    const u = new URL(document.referrer);

    utm.source = "referrer";
    utm.medium = u.hostname;
    utm.campaign = u.hostname + u.pathname;
    socialiseReferrer(u.hostname, utm);
  }
  utm.location = document.location.origin + document.location.pathname;
  return utm;
};

const create = (base, path, params) => {
  const url = path.startsWith("http") ? new URL(path) : new URL(path, base);
  const search = new URLSearchParams();
  for (const [key, value] in params) {
    search.append(key, value);
  }
  url.search = search;
  return url;
};

const urlParser = { utm: utm, data: data, config: config };
export { utm, data, step, config, isTest, create, parse };
export default urlParser;
