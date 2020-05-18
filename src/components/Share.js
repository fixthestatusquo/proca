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
import Emoji from "./Emoji";
import uuid from "../lib/uuid";
import { addAction } from "../lib/server";
import Url from "../lib/urlparser";

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

  const shareUrl = (component) => {
    const url= new URL (window.location.href);
    let params = url.searchParams;

    params.set("utm_source","share");
    params.set("utm_medium",component.render.displayName.replace("ShareButton-",''));
    params.set("utm_campaign",uuid());

    return url.toString();

  };
  return (
<div><h3>Almost done! Take the next step.</h3>
<p>
Great, you’ve signed <Emoji symbol="👍"/>. To multiply your impact, share far and wide to make sure everyone sees this petition
<Emoji symbol="🙏" label="please" />.
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
        {metadata.description}
      </CardContent>
        <CardActions>
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
            icon={WhatsappIcon}
            component={WhatsappShareButton}
            separator=" "
          />
          <ActionIcon
            {...props}
            icon={FacebookIcon}
            component={FacebookShareButton}
          />
          <ActionIcon
            {...props}
            icon={TwitterIcon}
            component={TwitterShareButton}
          />
          <ActionIcon
            {...props}
            icon={TelegramIcon}
            component={TelegramShareButton}
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
      <IconButton component={props.component} url={shareUrl(props.component)} title={props.name}
        beforeOnClick={() => before(props)}
        onShareWindowClose={() => after(props)}
        >
        {props.icon ? props.icon({ round: true, size: 64 }) : null}
      </IconButton>
    );
  }
}
