import React,{useState} from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import SvgIcon from '@material-ui/core/SvgIcon';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from "prop-types";
// TODO: use it to check tweets' length https://www.npmjs.com/package/twitter-text

//import { ReactComponent as TwitterIcon } from '../images/Twitter.svg';
import EmailIcon from '@material-ui/icons/Email';

import {addAction} from '../lib/server';
import uuid from '../lib/uuid';


const component= function TwitterAction(profile) {
  const [disabled, disable] = useState(false);
  const [selected, select] = useState(false);
  const img = () => profile.profile_image_url_https;

  function addTweet (event,screenName) {
    addAction(profile.actionPage,event,{
        uuid: uuid(),
//        tracking: Url.utm(),
        payload: [{key:"screen_name",value:screenName}]
    });
  }


  const mail=(e) => {
    let t = typeof profile.actionText == "function" ? profile.actionText(profile): profile.actionText;

    if (profile.actionUrl) {
      if (t.indexOf("{url}") !== -1) 
        t = t.replace("{url}", profile.actionUrl);
      else t = t+ " " + profile.actionUrl;
    }

    const body ="";
    var url = "mailto:"+profile.email+"?subject="+ encodeURIComponent(t)+"&body="+encodeURIComponent(body);
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
      addTweet("emai_close",profile.screen_name);
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
