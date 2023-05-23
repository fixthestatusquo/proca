import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";

const PayrexxFrame = (props) => {
  const fields = {
    firstname: "contact_forename",
    lastname: "contact_surname",
    postcode: "contact_postcode",
    email: "contact_email",
    locality: "contact_place",
    country: "contact_country",
  };
  const config = useCampaignConfig();
  const [data] = useData();
  console.log(data);
  if (!config.component.donation?.payrexx?.cid)
    return "payrexx not configured, missing config component.donation.payrexx.cid";

  let url =
    "https://campax.payrexx.com/" +
    config.lang +
    "/pay?cid=" +
    config.component.donation?.payrexx?.cid +
    "&donation[preselect_amount]=35.00&donation[preselect_interval]=one_time&appview=1";
  Object.entries(fields).map(([k, v]) => {
    if (data[k]) url += "&" + v + "=" + encodeURIComponent(data[k]);
    return null;
  });
  return (
    <iframe
      src={url}
      title="proca payrexx"
      width="100%"
      height="800"
      style={{ border: 0 }}
      id="payrexx-embed"
    ></iframe>
  );
};

export default PayrexxFrame;
