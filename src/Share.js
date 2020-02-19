import React from "react";

//import { Container, Grid } from "@material-ui/core";

import {
  IconButton,
  ButtonGroup,
  Button,
  Typography,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia

} from "@material-ui/core";

import metadataparser from "page-metadata-parser";
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
  const shareUrl = window.location.href;
  const metadata = metadataparser.getMetadata(window.document, window.location);
  return (
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
        {metadata.provider ? (
          <Typography variant="body2" color="textSecondary" component="p">
            {metadata.provider}
          </Typography>
        ) : null}
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
  );

  function DisplayActions(props) {
    return (
      <CardActions>
        <ButtonGroup orientation="vertical" className={classes.margin}>
          <Button
            component={EmailShareButton}
            url={shareUrl}
            subject={props.name}
            startIcon={<EmailIcon size={32} round />}
            variant="contained"
            color="primary"
          >
            Share by Email
          </Button>
          <Button
            component={WhatsappShareButton}
            url={shareUrl}
            title={props.name}
            separator=" "
            startIcon={<WhatsappIcon size={32} round />}
            variant="contained"
            color="primary"
          >
            Share on Whatsapp
          </Button>
          <Button
            component={FacebookShareButton}
            url={shareUrl}
            startIcon={<FacebookIcon size={32} round />}
            variant="contained"
            color="primary"
          >
            Share on Facebook
          </Button>
          <Button
            component={TwitterShareButton}
            url={shareUrl}
            title={props.name}
            startIcon={<TwitterIcon size={32} round />}
            variant="contained"
            color="primary"
          >
            Share on Twitter
          </Button>

          <Button
            component={TelegramShareButton}
            variant="contained"
            color="primary"
            url={shareUrl}
            title={props.name}
            startIcon={<TelegramIcon size={32} round />}
          >
            Share on Telegram
          </Button>
          <Button
            component={RedditShareButton}
            url={shareUrl}
            title={props.name}
            variant="contained"
            color="primary"
            startIcon={<RedditIcon size={32} round />}
          >
            Share on Reddit
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={LinkedinShareButton}
            url={shareUrl}
            title={props.name}
            startIcon={<LinkedinIcon size={32} round />}
          >
            Share on Linkedin
          </Button>
        </ButtonGroup>
      </CardActions>
    );
  }
  function ActionIcon(props) {
    return (
      <IconButton component={props.component} url={shareUrl} title={props.name}>
        {props.icon ? props.icon({ round: true, size: 64 }) : null}
      </IconButton>
    );
  }
}
