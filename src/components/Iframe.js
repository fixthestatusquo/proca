import React, { useEffect } from "react";

import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
const Iframe = (props) => {
  const config = useCampaignConfig();
  const [data] = useData();
  if (data.country) data.country = data.country.toLowerCase();
  let url = config.component.iframe.url;
  var param = [];
  "firstname,lastname,country,postcode".split(",").forEach((k) => {
    if (k in data) {
      param.push(k + "=" + encodeURIComponent(data[k]));
    }
  });
  if (param.length > 0) url += "&" + param.join("&");
  if (config.component.iframe.hash)
    url = url + "#" + config.component.iframe.hash;
  const iframeOrigin = new URL(url).origin;

  const done = props.done;

  useEffect(() => {
    window.addEventListener(
      "message",
      (event) => {
        if (event.origin !== iframeOrigin) return;
        document
          .getElementsByClassName("proca-widget")[0]
          .scrollIntoView({ behavior: "smooth", block: "start" });
        if (
          config.component.iframe.successMessage &&
          event.data === config.component.iframe.successMessage
        )
          done();
      },
      false
    );
  }, [done, config.component.iframe.successMessage, iframeOrigin]);
  return (
    <iframe
      style={{ border: "none" }}
      width={config.component.iframe.width}
      height={config.component.iframe.height}
      title="proca"
      src={url}
    >
      In iframe
    </iframe>
  );
};

export default Iframe;
