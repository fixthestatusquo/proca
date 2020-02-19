import React from "react";

//import { Container, Grid } from "@material-ui/core";

import { ButtonGroup, Button } from "@material-ui/core";

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
    "& > *": {
      margin: theme.spacing(1)
    }
  },
  root: {
    display: "flex",
    "& Button": { justifyContent: "left" },
    "& span": { justifyContent: "left",padding:"5px 10px" },
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
      <ButtonGroup
        orientation="vertical"
        className={classes.margin}
      >
        <Button
          component={EmailShareButton}
          url={shareUrl}
          subject={props.name}
          startIcon={<EmailIcon size={32} round/>}
    variant="contained" color="primary"
        >
          Share by Email
        </Button>
        <Button
          component={WhatsappShareButton}
          url={shareUrl}
          title={props.name}
          separator=" "
          startIcon={<WhatsappIcon size={32} round/>}
    variant="contained" color="primary"
        >
          Share on Whatsapp
        </Button>
        <Button component={FacebookShareButton} url={shareUrl}
          startIcon={<FacebookIcon size={32} round/>}
    variant="contained" color="primary"
    
    >
          Share on Facebook
        </Button>
        <Button
          component={TwitterShareButton}
          url={shareUrl}
          title={props.name}
          startIcon={<TwitterIcon size={32} round/>}
    variant="contained" color="primary"
        >
          Share on Twitter
        </Button>

        <Button
          component={TelegramShareButton}
    variant="contained" color="primary"
          url={shareUrl}
          title={props.name}
          startIcon={<TelegramIcon size={32} round/>}
        >
          Share on Telegram
        </Button>
        <Button component={RedditShareButton} url={shareUrl} title={props.name}
    variant="contained" color="primary"
          startIcon={<RedditIcon size={32} round/>}
    >
          Share on Reddit
        </Button>
        <Button
    variant="contained" color="primary"
          component={LinkedinShareButton}
          url={shareUrl}
          title={props.name}
          startIcon={<LinkedinIcon size={32} round/>}
        >
          Share on Linkedin
        </Button>
      </ButtonGroup>
    </div>
  );
}
