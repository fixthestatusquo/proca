import React from "react";

//import { Container, Grid } from "@material-ui/core";

import {
  IconButton,
//  ButtonGroup,
//  Button,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia

} from "@material-ui/core";

import metadataparser from "page-metadata-parser";
import uuid from "../lib/uuid";
import { addAction } from "../lib/server";
import Url from "../lib/urlparser";
import { useTranslation } from "react-i18next";

import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
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
  FacebookMessengerIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  EmailIcon
} from "react-share";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  media: {
    height: 0,
    paddingTop: "52.5%" // FB ratio
  },
  aamargin: {
    margin: theme.spacing(1),
    "& > *": {
      margin: theme.spacing(1)
    }
  },
  root: {
    "& p": {fontSize: theme.typography.pxToRem(16)},
    "& h3": {fontSize: theme.typography.pxToRem(20)}
  },
  widroot: {
    "& Button": { justifyContent: "left" },
    "& span": { justifyContent: "left", padding: "5px 10px" },
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
  const actionPage= props.actionPage;
  const metadata = metadataparser.getMetadata(window.document, window.location);
  const {t} = useTranslation();

  const shareUrl = (component) => {
    const url= new URL (window.location.href);
    let params = url.searchParams;

    params.set("utm_source","share");
    params.set("utm_medium",component.render.displayName.replace("ShareButton-",''));
    params.set("utm_campaign",uuid());

    return url.toString();

  };
  return (
<div className={classes.root}><h3>{t("share.title")}</h3>
<p>{t("share.intro")}
    </p>
    <Card className={classes.root}>
      <CardHeader title={metadata.title} subheader={metadata.provider} />

      {metadata.image ? (
        <CardMedia
          className={classes.media}
          image={metadata.image}
          title={metadata.title}
        />
      ) : null}
      <CardContent>
        <p>{metadata.description}</p>
      </CardContent>
        <CardActions>
          <ActionIcon
            {...props}
            icon={WhatsappIcon}
            title={props['share-whatsapp'] || props.share}
            component={WhatsappShareButton}
          />
          <ActionIcon
            {...props}
            icon={FacebookMessengerIcon}
            title={props['share-whatsapp'] || props.share}
            component={FacebookMessengerShareButton}
          />
          <ActionIcon
            {...props}
            icon={FacebookIcon}
            component={FacebookShareButton}
          />
          <ActionIcon
            {...props}
            icon={TwitterIcon}
            title={props['share-twitter'] || props.share}
            component={TwitterShareButton}
          />
          <ActionIcon
            {...props}
            icon={TelegramIcon}
            component={TelegramShareButton}
          />
          <ActionIcon
            {...props}
            icon={EmailIcon}
            component={EmailShareButton}
            subject={props.name}
            body={props.description}
            separator=" "
          />
          <ActionIcon
            {...props}
            icon={RedditIcon}
            component={RedditShareButton}
          />
          <ActionIcon
            {...props}
            icon={LinkedinIcon}
            component={LinkedinShareButton}
          />
        </CardActions>
    </Card>
    </div>
  );

  function ActionIcon(props) {
    const medium = props.component.render.displayName.replace("ShareButton-",'');
    function addShare (event) {
      addAction(actionPage,event,{
        uuid: uuid(),
        payload: [{key:"medium",value:medium}],
        tracking: Url.utm()
      });
    }

    function after (props) {
      addShare ("share_close");
      console.log("closing "+medium);
    }

    function before (props) {
      addShare ("share_click");
      console.log("clicking "+medium);
    }

    return (
      <IconButton component={props.component} url={shareUrl(props.component)} title={props.title || props.share }
        beforeOnClick={() => before(props)}
        onShareWindowClose={() => after(props)}
        >
        {props.icon ? props.icon({ round: true, size: 48 }) : null}
      </IconButton>
    );
  }
}
