import React, { useEffect, useState } from "react";
//import Alert from "@components/Alert";
import { Alert } from "@material-ui/lab";
import BugReportIcon from "@material-ui/icons/BugReport";

import { useCampaignConfig } from "@hooks/useConfig";
import { Grid } from "@material-ui/core";
//import useData from "@hooks/useData";
import { parse } from "dxid";
const src = (props) => {
  let params = {};
  const config = useCampaignConfig();
  const [open, setOpen] = useState(true);
  //const [data, setData] = useData();
  const urlParams = new URLSearchParams(window.location.search);

  useEffect ( () => {
    if (window.drupalSettings && window.drupalSettings.user) {
      console.log("connected user");
      config.test=true;
    }
},[]);
  const _src = urlParams.get("src");
  if (_src) {
  const src = _src.split("-");
  if (src.length !== 3) {
    console.error("not the right src length", src);
    return null;
  }
  params = {
    "promocode": parse(src[0]),
    "promocode_phone": parse(src[1]),
    "bannerid": parse(src[2])
  }
  document.querySelectorAll('a[href]').forEach(link => { // TODO: only update the donation link
    try {
        let url = new URL(link.href, window.location.origin);
        url.searchParams.set('BannerID', params.bannerid);
        link.href = url.toString();
    } catch (e) {
        console.warn('Malformed URL:', link.href);
    }
  });
  
  let custom = props.myref?.current;
  if (!custom) {
    custom=params;
  }
  }
  if (config.test && open)
    return (
      <Grid item xs={12}>
        <Alert
          icon={<BugReportIcon fontSize="inherit" />}
          severity="info"
          onClose={() => setOpen(false)}
        >
          <ul>
           <li><a href={"https://we.fixthestatusquo.org/widget/" + config.actionPage}>Widget admin</a></li>
           {Object.entries(params).map ( ([key,value])=> (<li key={key}><b>{key}</b> = {value}</li>))}
          </ul>
        </Alert>
      </Grid>
    );
  return null;
};

export default src;
