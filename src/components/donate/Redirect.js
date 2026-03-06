import ABTest from "@components/ABTest";
import get from "lodash/get";
import { useCampaignConfig } from "@hooks/useConfig";

const tokenize = (str, obj, { prefix = "config" } = {}) => {
  const top = prefix + ".";
  const prefixLength = top.length;
  const result = str.replace(/\{([^}]+)\}/g, (match, path) => {
    if (!path.startsWith(top)) return match;
    return get(obj, path.slice(prefixLength), path.slice(prefixLength));
  });
  return result;
};

const DonateRedirect = () => {
  const config = useCampaignConfig();
  const url = tokenize(config.component.donation?.external?.url, config);
  if (!config.test) {
    window.location.href = url;
    return "Loading...";
  }
  return (
    <>
      <ABTest sticky />
      promocode: {config.component.sync.promoCode.default}
      <br />
      bannerId: {config.component.sync.bannerId}
      <br />
      <a href={url} target="_blank">
        {url}
      </a>
    </>
  );
};
export default DonateRedirect;
