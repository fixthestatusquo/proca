import React, { useState } from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import SvgIcon from "@material-ui/core/SvgIcon";
import IconButton from "@material-ui/core/IconButton";
import Url from "@lib/urlparser";
// TODO: use it to check tweets' length https://www.npmjs.com/package/twitter-text

//import { ReactComponent as TwitterIcon } from '../images/Twitter.svg';
import TwitterIcon from "../../images/Twitter.js";
import { useTranslation } from "react-i18next";

import { addAction } from "@lib/server";
import { tokenize } from "@lib/text";
import uuid from "@lib/uuid";

const tweet = (params) => {
  const { message, screen_name, actionUrl, done, actionPage } = params;
  const addTweet = (event, screenName) => {
    addAction(actionPage, event, {
      uuid: uuid(),
      tracking: Url.utm(),
      payload: { screen_name: screenName },
    });
  };

  const url =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tokenize(message, {
        profile: { screen_name: screen_name },
        url: actionUrl,
      })
    )}`;
  const win = window.open(
    url,
    `tweet-${screen_name}`,
    "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=550"
  );
  addTweet("twitter_click", screen_name);

  var timer = setInterval(() => {
    if (!win) return; // window popup blocked?
    const closed = win.closed;
    if (closed) {
      clearInterval(timer);
      addTweet("twitter_close", screen_name);
      if (done instanceof Function) done();
    }
  }, 10000);
};

const TwitterAction = (profile) => {
  const [disabled, disable] = useState(false);
  const [selected, select] = useState(false);
  const img = () => profile.profile_image_url_https;
  const { t } = useTranslation();

  const clickable = profile.clickable;

  const onClick = () => {
    const done = () => {
      disable(true);
      select(false);
      profile.done && profile.done();
    };
    tweet({
      actionPage: profile.actionpage,
      message:
        profile.form.getValues("message") ||
        t(["campaign:twitter.actionText", "twitter.actionText"], ""),
      screen_name: profile.screen_name,
      actionUrl: profile.actionUrl,
      done: done,
    });
    select(true);
  };

  return (
    <ListItem
      alignItems="flex-start"
      key={profile.screen_name}
      selected={selected}
      disabled={disabled}
      button={clickable}
      onClick={onClick}
      divider={false}
    >
      <ListItemAvatar>
        <Avatar src={img()} />
      </ListItemAvatar>
      <ListItemText primary={profile.name} secondary={profile.description} />
      {clickable && (
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="Tweet" onClick={onClick}>
            <SvgIcon>
              <TwitterIcon />
            </SvgIcon>
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default TwitterAction;
export { tweet };
