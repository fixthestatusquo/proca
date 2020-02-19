import React from "react";

//import { Container, Grid } from "@material-ui/core";

import { ButtonGroup } from "@material-ui/core";

import {
  EmailShareButton,
  FacebookShareButton,
//  InstapaperShareButton,
//  LineShareButton,
  LinkedinShareButton,
//  LivejournalShareButton,
//  MailruShareButton,
//  OKShareButton,
//  PinterestShareButton,
//  PocketShareButton,
  RedditShareButton,
  TelegramShareButton,
//  TumblrShareButton,
  TwitterShareButton,
//  ViberShareButton,
//  VKShareButton,
  WhatsappShareButton,
//  WorkplaceShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  EmailIcon
} from "react-share";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1),
    "& > *":{
    margin: theme.spacing(1),
    }
  },
  root: {
    display: "flex",
    "& Button": {textAlign:"left"},
    "& Button svg": {marginRight:"20px"},
    "& > *": {
      margin: theme.spacing(1)
    }
  }
}));
/*
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
*/


export default function ShareAction(props) {
  const classes = useStyles();
  const shareUrl = window.location.href;
  return (
    <div className={classes.root}>
    <ButtonGroup orientation="vertical" variant="contained" color="primary" size="large" className={classes.margin}>
    <EmailShareButton url={shareUrl} subject={props.name}>
      <EmailIcon size={32} round />Share by Email</EmailShareButton>
    <WhatsappShareButton url={shareUrl} title={props.name} separator=" "><WhatsappIcon size={32} round />Share on Whatsapp</WhatsappShareButton>
    <FacebookShareButton url={shareUrl}><FacebookIcon size={32} round />Share on Facebook</FacebookShareButton>
    <TwitterShareButton url={shareUrl} title={props.name}><TwitterIcon size={32} round />Share on Twitter</TwitterShareButton>
    <TelegramShareButton url={shareUrl} title={props.name}><TelegramIcon size={32} round />Share on Telegram</TelegramShareButton>
    <RedditShareButton url={shareUrl} title={props.name}><RedditIcon size={32} round />Share on Reddit</RedditShareButton>
    <LinkedinShareButton url={shareUrl} title={props.name}><LinkedinIcon size={32} round />Share on Linkedin</LinkedinShareButton>
      </ButtonGroup>
    </div>
  );
}
