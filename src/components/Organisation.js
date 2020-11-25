import React, { useState } from "react";
import { useTranslation } from "react-i18next";
//import useConfig from "../hooks/useConfig";

import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import InputAdornment from "@material-ui/core/InputAdornment";
import TwitterIcon from "../images/Twitter.js";
import SvgIcon from "@material-ui/core/SvgIcon";

import TextField from "./TextField";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles((theme) => ({
  profile: {
    backgroundColor: theme.palette.background.paper,
    padding: "2px",
  },
}));

export default (props) => {
  const classes = useStyles();

  const { t } = useTranslation();
  //  const { config } = useConfig();
  const [profile, setProfile] = useState({
    name: t("Your organisation account"),
  });

  const compact = props.compact;
  const { setValue, setError, watch } = props.form;
  const field = watch(["organisation", "picture", "comment"]);

  //variant={options.variant}
  //margin={options.margin}
  const handleBlur = (e) => {
    props.form.handleBlur && props.form.handleBlur(e);
    if (!e.target.value) return;
    const api =
      "https://twitter-proxy.tttp.workers.dev/?screen_name=" + e.target.value;
    //    const api = "https://twitter.proca.app/?screen_name="+e.target.value;
    const field = e.target.attributes.name.nodeValue;
    async function fetchAPI() {
      await fetch(api)
        .then((res) => {
          if (!res.ok) {
            throw Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res && res.error) {
            setProfile({ name: "?", url: "", description: "" });
            setError(field, "api", res.message.errors[0].message);
            return;
          }
          res.name = res.name
            .replace(
              /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
              ""
            ) // no emoji
            .replace(/#\w\w+\s?/g, ""); // no hashtag
          setProfile(res);
          if (res.url) {
            setValue("url", res.url);
            const domain = new URL(res.url).hostname;
            domain && setValue("email", "@" + domain.replace("www.", ""));
          }
          setValue("followers_count", res.followers_count);

          setValue("organisation", res.name);
          setValue("picture", res.profile_image_url_https);
          setValue("comment", res.description);
          setValue("twitter", res.screen_name);
        })
        .catch((err) => {
          console.log(err);
          setProfile({ name: "?", url: "", description: "" });
        });
    }

    fetchAPI();
  };

  return (
    <>
      <Grid item xs={12} sm={compact ? 12 : 4}>
        <TextField
          name="twitter"
          onBlur={handleBlur}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SvgIcon>
                  <TwitterIcon />
                </SvgIcon>
              </InputAdornment>
            ),
          }}
          required
          label={t("Account")}
          form={props.form}
        />
      </Grid>
      <Grid item xs={12} sm={compact ? 12 : 8}>
        <List className={classes.profile} dense={true} disablePadding={true}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar src={field.picture}>?</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={field.organisation}
              secondary={field.comment}
            />
          </ListItem>
        </List>
      </Grid>
      {profile.id ? (
        <>
          <Grid item xs={12} sm={compact ? 12 : 12}>
            <TextField name="organisation" required form={props.form} />
            <input type="hidden" ref={props.form.register} name="comment" />
            <input type="hidden" ref={props.form.register} name="picture" />
            <input type="hidden" ref={props.form.register} name="url" />
            <input
              type="hidden"
              ref={props.form.register}
              name="followers_count"
            />
          </Grid>
        </>
      ) : null}
    </>
  );
};
