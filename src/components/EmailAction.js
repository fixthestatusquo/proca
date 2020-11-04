import React,{useState} from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import SvgIcon from '@material-ui/core/SvgIcon';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
// TODO: use it to check tweets' length https://www.npmjs.com/package/twitter-text

//import { ReactComponent as TwitterIcon } from '../images/Twitter.svg';
import EmailIcon from '@material-ui/icons/Email';

import {addAction} from '../lib/server';
import uuid from '../lib/uuid';


const component= function TwitterAction(profile) {
  const [disabled, disable] = useState(false);
  const [selected, select] = useState(false);
  const img = () => profile.profile_image_url_https;
  const { t } = useTranslation();
 
  function addTweet (event,screenName) {
    addAction(profile.actionPage,event,{
        uuid: uuid(),
//        tracking: Url.utm(),
        payload: [{key:"screen_name",value:screenName}]
    });
  }


  const mail=(e) => {
    let s = typeof profile.subject == "function" ? profile.subject(profile): t("email.subject");

    if (profile.actionUrl) {
      if (s.indexOf("{url}") !== -1) 
        s = s.replace("{url}", profile.actionUrl);
      else s = s+ " " + profile.actionUrl;
    }

    const body =t("email.body");
    var url = "mailto:"+profile.email+"?subject="+ encodeURIComponent(s)+"&body="+encodeURIComponent(body);
    var win = window.open(
      url,
      "mailto-"+profile.screen_name,
      "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=550"
    );
    select(true);
    addTweet("email_click",profile.screen_name);

    var timer = setInterval( () => {
    if(win.closed) {
      clearInterval(timer);
      disable(true);
      select(false);
      addTweet("email_close",profile.screen_name);
      if (profile.done instanceof Function)
        profile.done();
    }}, 1000);

  };

  return (
      <ListItem alignItems="flex-start" selected={selected} disabled={disabled} button={true} onClick={mail} divider={true}>
        <ListItemAvatar>
          <Avatar 
             src={img()} />
        </ListItemAvatar>
        <ListItemText
          primary={profile.name}
          secondary={profile.description}
        />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="Tweet" onClick={mail}>
                      <EmailIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
      </ListItem>
  );
}

//component.defaultProps = {
//  screen_name = "eucampaign";
//  text
//  via
//}

// you can have actionText (text of function(profile))
component.propTypes = {
  screen_name: PropTypes.string.isRequired,
  name: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  actionUrl : PropTypes.string,
  description : PropTypes.string,
  className: PropTypes.string,
  
};
export default component;
