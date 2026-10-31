import { displayUrl } from "@lib/urlparser";
import { useCampaignConfig } from "@components/ABTest";
import get from "lodash/get";
//import { useCampaignConfig } from "@hooks/useConfig";

const tokenize = (str, obj, { prefix = "config" } = {}) => {
  const top = `${prefix}.`;
  const prefixLength = top.length;
  const result = str.replace(/\{([^}]+)\}/g, (match, path) => {
    if (!path.startsWith(top)) return match;
    return get(obj, path.slice(prefixLength), path.slice(prefixLength));
  });
  return result;
};

const DonateRedirect = () => {
  // const config = useCampaignConfig();
  const config = useCampaignConfig();

  let url = tokenize(config.component.donation?.external?.url, config);
  url = tokenize(
    url,
    Object.fromEntries(new URLSearchParams(window.location.search)),
    { prefix: "get" }
  );
  if (!config.test) {
    let target;
    try {
      target = new URL(url, window.location.href);
    } catch {
      console.error("invalid redirect url", url);
      return "Invalid redirect";
    }
    if (target.protocol !== "https:" && target.protocol !== "http:") {
      console.error("invalid redirect protocol", target.protocol);
      return "Invalid redirect";
    }
    window.location.assign(target.toString());
    return "Loading...";
  }

  //<ABTest sticky />
  return (
    <>
      promocode: {config.component.sync.promoCode.default}
      <br />
      bannerId: {config.component.sync.bannerId}
      <br />
      <a href={url} target="_blank">
        {displayUrl(url)}
      </a>
    </>
  );
};
export default DonateRedirect;
