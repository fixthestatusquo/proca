import React, { useState } from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import SvgIcon from "@material-ui/core/SvgIcon";
import IconButton from "@material-ui/core/IconButton";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
// TODO: use it to check tweets' length https://www.npmjs.com/package/twitter-text

import TwitterIcon from "../images/Twitter.js";
import eugroups from "../data/eugroups.json";
import { Flag } from "@components/field/Country";
import { addAction } from "@lib/server";
import uuid from "@lib/uuid";

const useStyles = makeStyles(() => ({
  icon: {
    display: "inline-block",
    width: "20px",
    height: "20px",
    "& img": {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
}));

const component = function MepAction(profile) {
  const classes = useStyles();
  const [disabled, disable] = useState(false);
  const [selected, select] = useState(false);
  const img = () =>
    `https://www.europarl.europa.eu/mepphoto/${profile.epid}.jpg`;

  function addTweet(event, screenName) {
    addAction(profile.actionPage, event, {
      uuid: uuid(),
      //        tracking: Url.utm(),
      payload: [{ key: "Twitter", value: screenName }],
    });
  }

  const tweet = () => {
    let t =
      typeof profile.actionText == "function"
        ? profile.actionText(profile)
        : profile.actionText;

    if (t.indexOf("{@}") !== -1) t = t.replace("{@}", `@${profile.Twitter}`);
    else t = `.@${profile.Twitter} ${t}`;

    if (profile.actionUrl) {
      if (t.indexOf("{url}") !== -1) t = t.replace("{url}", profile.actionUrl);
      else t = `${t} ${profile.actionUrl}`;
    }

    var url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`;
    var win = window.open(
      url,
      `tweet-${profile.Twitter}`,
      "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=550"
    );
    select(true);
    addTweet("twitter_click", profile.Twitter);
    var timer = setInterval(() => {
      if (win.closed) {
        clearInterval(timer);
        addTweet("twitter_close", profile.Twitter);
        disable(true);
        select(false);
        if (profile.done instanceof Function) profile.done();
      }
    }, 10000);
  };

  return (
    <ListItem
      alignItems="flex-start"
      selected={selected}
      disabled={disabled}
      button={true}
      onClick={tweet}
      divider={true}
    >
      <ListItemAvatar>
        <Avatar src={img()} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            <Flag
              className={classes.icon}
              country={profile.constituency?.country}
            />
            <span>
              {profile.first_name} {profile.last_name}{" "}
            </span>
          </>
        }
        secondary={
          <>
            <span className={classes.icon}>
              {" "}
              <img
                src={
                  `https://www.tttp.eu/img/group/${eugroups[profile.eugroup].picture}`
                }
                title={eugroups[profile.eugroup].name}
                alt={profile.eugroup}
              />
            </span>
            {profile.constituency?.party}
          </>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="Tweet" onClick={tweet}>
          <SvgIcon>
            <TwitterIcon />
          </SvgIcon>
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

//component.defaultProps = {
//  Twitter = "eucampaign";
//  text
//  via
//}

// you can have actionText (text of function(profile))
component.propTypes = {
  image: PropTypes.string,
  url: PropTypes.string,
  actionUrl: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
};
export default component;
