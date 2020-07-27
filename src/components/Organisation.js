import React, { useState } from "react";
import { useTranslation } from "react-i18next";
//import useConfig from "../hooks/useConfig";

import { Grid} from "@material-ui/core";
import TextField from "./TextField";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

export default props => {
  const { t } = useTranslation();
//  const { config } = useConfig();
  const [profile, setProfile] = useState({
    name: "Your organisation account",
  });

  const compact = false;
  const {setValue, setError} =props.form;

  //variant={options.variant}
  //margin={options.margin}
  const handleBlur = (e) => {
    props.form.handleBlur(e);
    if (!e.target.value) return;
    const api = "https://twitter-proxy.tttp.workers.dev/?screen_name="+e.target.value;
//    const api = "https://twitter.proca.app/?screen_name="+e.target.value;
    const field = e.target.attributes.name.nodeValue;
    async function fetchAPI() {
      await fetch(api)
      .then (res => {
        if (!res.ok) { throw Error(res.statusText); }
        return res.json()
      })
      .then(res => {
        if (res && res.error) {
          setProfile({name:"?",url:"",description:""})
          setError(
            field,
            "api",
            res.message.errors[0].message
          );
          return;
        }
        setProfile(res);
        setValue("organisation",res.name);
        setValue("picture",res.profile_image_url_https);
        setValue("comment",res.description);
      })
      .catch(err => { 
        console.log(err);
        setProfile({name:"?",url:"",description:""})
      })
    }

    fetchAPI();
    console.log("fetch the account");
  };


  return (
    <>
      <Grid item xs={12} sm={compact ? 12 : 4}>
        <TextField
          name="twitter"
          onBlur = {handleBlur}
          placeholder="eg. @eucampaign"
          required
          label={t("Twitter account")}
          form = {props.form}
        />
      </Grid>
      <Grid item xs={12} sm={compact ? 12 : 8}>
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar src={profile.profile_image_url_https} />
          </ListItemAvatar>
          <ListItemText
            primary={profile.name}
            secondary={profile.description}
          />
        </ListItem>
      </Grid>
    {profile.id ? <> 
      <Grid item xs={12} sm={compact ? 12 : 4}>
        <TextField
          name="organisation"
          required
          form = {props.form}
        />

      </Grid>
      <Grid item xs={12} sm={compact ? 12 : 8}>
        <TextField
          name="picture"
          type = "url"
          form = {props.form}
        />
      </Grid>
      </>
    : null }
    </>
  );
};
