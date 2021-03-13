import React from "react";

/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import { useCampaignConfig } from "../hooks/useConfig";
import useData from "../hooks/useData";
const Iframe = (props) => {
  const config = useCampaignConfig();
  const [data] = useData();
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
  console.log(url);
  return (
    <iframe
      style={{ border: "none" }}
      width={config.component.iframe.width}
      height={config.component.iframe.height}
      src={url}
    >
      In iframe
    </iframe>
  );
};

export default Iframe;
