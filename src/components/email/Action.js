import React, { useState } from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import Selectable, { toggleSelection } from "./Selectable";

// TODO: use it to check tweets' length https://www.npmjs.com/package/twitter-text

import EmailIcon from "@material-ui/icons/Email";

import { addAction } from "@lib/server";
import uuid from "@lib/uuid";

const useStyles = makeStyles( theme => ({
  secondaryText: {
    marginRight: theme.spacing(2), // Adjust this value as needed
  },
}));

const EmailAction = ({ profile, display, disabled: _disabled, selection, setSelection }) => {
  const classes = useStyles(); // Use the custom styles

  const [disabled, disable] = useState(_disabled);
  const [selected, select] = useState(false);
  const img = () => profile.profile_image_url_https;
  const { t } = useTranslation();
  const config = useCampaignConfig();

  function addEmailAction(event, id) {
    addAction(profile.actionPage, event, {
      uuid: uuid(),
      //        tracking: Url.utm(),
      payload: [{ id: id }],
    });
  }

  const mail = () => {
    let s =
      typeof profile.subject == "function"
        ? profile.subject(profile)
        : t("campaign:email.subject");

    if (profile.actionUrl) {
      if (s.indexOf("{url}") !== -1) s = s.replace("{url}", profile.actionUrl);
      else s = s + " " + profile.actionUrl;
    }

    const body = t("campaign:email.body");
    var url =
      "mailto:" +
      profile.email +
      "?subject=" +
      encodeURIComponent(s) +
      "&body=" +
      encodeURIComponent(body);
    var win = window.open(url, "_blank");
    select(true);
    addEmailAction("email_click", profile?.screen_name || profile.id);

    var timer = setInterval(() => {
      if (win.closed) {
        clearInterval(timer);
        disable(true);
        select(false);
        addEmailAction("email_close", profile?.screen_name || profile.id);
        if (profile.done instanceof Function) profile.done();
      }
    }, 1000);
  };

  //config.component.email?.filter?.includes("display") && d.display}
  if (display === false) {
    return null;
  }

  const _classes = config.component.email?.selectable ? { secondary: classes.secondaryText } : undefined;
  return (
    <ListItem
      data-key={profile.procaid}
      alignItems="flex-start"
      component="div"
      disableGutters
      selected={selected}
      disabled={disabled}
      button={config.component.email?.selectable }
      onClick={() => {
        if (config.component?.email?.split === true) {
          mail();
        } else {
            config.component?.email?.selectable && toggleSelection(profile.procaid, setSelection)
        }
      }}
      divider={false}
    >
      <ListItemAvatar>
        <Avatar src={img()} />
      </ListItemAvatar>
      <ListItemText primary={profile.name} secondary={profile.description} 
      classes={_classes}
/>
      <Selectable
        profile={profile}
        selection={selection}
        setSelection={setSelection}
      />
      {config.component?.email?.split === true && (
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="Tweet" onClick={mail}>
            <EmailIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default EmailAction;
