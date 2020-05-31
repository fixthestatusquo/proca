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
import TwitterIcon from '../images/Twitter.js';

import {addAction} from '../lib/server';
import uuid from '../lib/uuid';


const component= function TwitterAction(profile) {
  const [disabled, disable] = useState(false);
  const [selected, select] = useState(false);
  const img = () => profile.profile_image_url_https;

  function urlify(text) { // WIP: to be used to add url tracking, needs to move to a lib
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    //var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url,b,c) {
        var url2 = (c === 'www.') ?  'https://' +url : url;
        return url2; //TODO add the utm params codes
    }) 
}
  function addTweet (event,screenName) {
    addAction(profile.actionPage,event,{
        uuid: uuid(),
//        tracking: Url.utm(),
        payload: [{key:"screen_name",value:screenName}]
    });
  }


  const tweet=(e) => {
    let t = typeof profile.actionText == "function" ? profile.actionText(profile): profile.actionText;

    if (t.indexOf("{@}") !== -1) 
      t = t.replace("{@}", "@" + profile.screen_name);
    else t = ".@" + profile.screen_name + " " + t;

    if (profile.actionUrl) {
      if (t.indexOf("{url}") !== -1) 
        t = t.replace("{url}", profile.actionUrl);
      else t = t+ " " + profile.actionUrl;
    }

    var url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(t);
    var win = window.open(
      url,
      "tweet-"+profile.screen_name,
      "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=550"
    );
    select(true);
    addTweet("twitter_click",profile.screen_name);

    var timer = setInterval( () => {
    if(win.closed) {
      clearInterval(timer);
      disable(true);
      select(false);
      addTweet("twitter_close",profile.screen_name);
      if (profile.done instanceof Function)
        profile.done();
    }}, 1000);

  };

  return (
      <ListItem alignItems="flex-start" selected={selected} disabled={disabled} button={true} onClick={tweet} divider={true}>
        <ListItemAvatar>
          <Avatar 
             src={img()} />
        </ListItemAvatar>
        <ListItemText
          primary={profile.name}
          secondary={profile.description}
        />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="Tweet" onClick={tweet}>

                      <SvgIcon><TwitterIcon/></SvgIcon>
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
