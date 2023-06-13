import React, { useState } from "react";
import { useTranslation } from "react-i18next";
//import useConfig from "@hooks/useConfig";

import { Grid, IconButton } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';

import InputAdornment from "@mui/material/InputAdornment";
import TwitterIcon from "../../images/Twitter.js";
import SvgIcon from "@mui/material/SvgIcon";

import TextField from "@components/TextField";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import SearchIcon from "@mui/icons-material/Search";

const useStyles = makeStyles((theme) => ({
  profile: {
    backgroundColor: theme.palette.background.paper,
    padding: "2px",
  },
}));

const Organisation = (props) => {
  const classes = useStyles();

  const { t } = useTranslation();
  //  const { config } = useConfig();
  const [profile, setProfile] = useState({
    name: t("twitter.organisation", "Your organisation twitter account"),
  });

  const compact = props.compact;
  const { setValue, getValues, setError, watch, register } = props.form;

  const array = watch(["organisation", "picture", "comment", "twitter"]);
  const field = {
    organisation: array[0],
    picture: array[1],
    comment: array[2],
    twitter: array[3],
  };

  //variant={options.variant}
  //margin={options.margin}
  const handleBlur = (e) => {
    props.form.handleBlur && props.form.handleBlur(e);
    fetchTwitter(e.target.value);
  };

  const fetchTwitter = (screenName) => {
    if (!screenName) {
      return;
    }

    const api =
      "https://twitter.proca.app?screen_name=" +
      screenName.replace("https://twitter.com/", "");
    //    const api = "https://twitter.proca.app/?screen_name="+e.target.value;
    const field = "twitter";
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

  const handleClick = () => {
    console.log("click", getValues("twitter"));
    fetchTwitter(getValues("twitter"));
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Grid item xs={12} sm={compact ? 12 : 6}>
        <TextField
          name="twitter"
          onBlur={handleBlur}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {field.twitter ? (
                  <IconButton
                    aria-label="Fetch details from Twitter"
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    size="large">
                    <SearchIcon />
                  </IconButton>
                ) : (
                  <SvgIcon>
                    <TwitterIcon />
                  </SvgIcon>
                )}
              </InputAdornment>
            ),
          }}
          required
          label={t("twitter.screenName", "Screen name")}
          form={props.form}
        />
      </Grid>
      <Grid item xs={12} sm={compact ? 12 : 6}>
        <List className={classes.profile} dense={true} disablePadding={true}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar src={field.picture}>?</Avatar>
            </ListItemAvatar>
            <ListItemText primary={field.organisation} />
          </ListItem>
        </List>
      </Grid>
      {profile.id ? (
        <>
          <Grid item xs={12} sm={compact ? 12 : 12}>
            <TextField name="organisation" required form={props.form} />
            <input type="hidden" {...register("comment")} />
            <input type="hidden" {...register("picture")} />
            <input type="hidden" {...register("url")} />
            <input type="hidden" {...register("followers_count")} />
          </Grid>
        </>
      ) : null}
    </>
  );
};

export default Organisation;
