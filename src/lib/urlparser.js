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

const parse = (whitelist, prefix = "proca_") => {
  const url = Url(window.location, true);
  return filter(url.query, whitelist, prefix) || {};
};

const step = (prefix) => {
  const s = parse(["go"], prefix);
  return s.go || null;
};


/*
 * The proca core api does not provide a way to know the current step, so we are redirecting back
 * to the payment. This fun should probably be a helper
 */
const stepUrl = (step, params = {}, prefix = "proca_") => {
  const curLoc = new URL(window.location.href);
  curLoc.searchParams.delete("proca_go");
  curLoc.searchParams.append("proca_go", step.replace('/', '_'));

  for (const [k, v] of Object.entries(params)) {
    if (typeof v !== 'undefined') {
      curLoc.searchParams.delete(prefix + k);
      curLoc.searchParams.append(prefix + k, v);
    }
  }
  console.log("stepUrl", step, params, curLoc.href);
  return curLoc.href;
}

const data = (prefix) => {
  const whitelist = [
    "amount",
    "paymentMethod",
    "firstname",
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
  const r = parse(["test"]);
  return "test" in r;
};

const config = (prefix) => {
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
  if (domain === "twitter.com" || domain === "t.co") {
    utm.source = "social";
    utm.medium = "twitter";
    return true;
  }
  if (domain === "youtu.be" || domain === "youtube.com") {
    utm.source = "social";
    utm.medium = "youtube";
  }
  return false;
};

const utm = () => {
  const whitelist = ["source", "medium", "campaign", "content"];
  let utm = parse(whitelist, "utm_");

  if (0 === Object.keys(utm).length) {
    if (document.referrer) {
      const u = new URL(document.referrer);

      utm.source = "referrer";
      utm.medium = u.hostname;
      utm.campaign = u.hostname + u.pathname;
      socialiseReferrer(u.hostname, utm);
    } else {
      utm = { source: "", medium: "", campaign: "" };
    }
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

export { utm, data, step, stepUrl, config, isTest, create};
export default { utm: utm, data: data, config: config };
