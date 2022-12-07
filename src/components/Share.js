import React from "react";

//import { Container, Grid } from "@material-ui/core";

import {
  Container,
  IconButton,
  //  ButtonGroup,
  Button,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia,
} from "@material-ui/core";
import { AlertTitle } from "@material-ui/lab";
import Alert from "@components/Alert";
import metadataparser from "page-metadata-parser";
import uuid from "@lib/uuid";
import { addAction } from "@lib/server";
import Url from "@lib/urlparser";
import dispatch from "@lib/event";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import ShareIcon from "@material-ui/icons/Share";
import { useIsMobile } from "@hooks/useDevice";
import useData from "@hooks/useData";
import MailIcon from "@material-ui/icons/MailOutline";
import EmailConfirm from "@components/EmailConfirm";

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
  EmailIcon,
} from "react-share";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  media: {
    height: 0,
    paddingTop: "52.5%", // FB ratio
  },
  aamargin: {
    margin: theme.spacing(1),
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  root: {
    "& p": { fontSize: theme.typography.pxToRem(16) },
    "& h3": { fontSize: theme.typography.pxToRem(20) },
  },
  next: {
    margin: theme.spacing(1),
  },
  widroot: {
    "& Button": { justifyContent: "left" },
    "& span": { justifyContent: "left", padding: "5px 10px" },
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));
/*
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
*/
const ConfirmPreviousStep = (props) => {
  const { t, i18n } = useTranslation();
  const [data] = useData();

  const ConfirmTitle = (props) =>
    i18n.exists("consent.emailSent") && (
      <AlertTitle>{t("consent.emailSent", { email: props.email })}</AlertTitle>
    );

  if (props.email?.confirmOptIn && data.privacy === "opt-in") {
    return (
      <Alert severity="info" autoHideDuration={15000} icon={<MailIcon />}>
        <ConfirmTitle email={data.email} />
        {t("consent.confirmOptIn")}
      </Alert>
    );
  }

  if (props.email?.confirmAction && data.privacy) {
    return (
      <Alert severity="warning" autoHideDuration={15000} icon={<MailIcon />}>
        <ConfirmTitle email={data.email} />
        {t("consent.confirmAction", { email: data.email })}
      </Alert>
    );
  }
  if (data.privacy) {
    // we saved previously
    return <Alert severity="success">{t("Thank you")}</Alert>;
  }
  return null;
};

export default function ShareAction(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const actionPage = config.actionPage;
  const metadata = metadataparser.getMetadata(window.document, window.location);
  const { t, i18n } = useTranslation();

  const shareUrl = (component) => {
    // the share by email is assumed to have the url already set in the body, skip adding it as a footer of the message
    if (component.render?.displayName && component.render.displayName.includes("email")) return "";
    const medium =
      typeof component === "string"
        ? component
        : component.render.displayName.replace("ShareButton-", "");
    const url = new URL(window.location.href);
    let params = url.searchParams;
    params.set("utm_source", "share");
    params.set("utm_medium", medium);
    params.set("utm_campaign", uuid());
    let garbage = [];
    for (const key of params.keys()) {
      if (key === "doi") garbage.push(key);
      if (key.startsWith("proca_")) garbage.push(key);
    }
    if (config?.component?.share?.utm === false) {
      ["utm_source", "utm_medium", "utm_campaign"].forEach((d) =>
        garbage.push(d)
      );
    }
    garbage.forEach((key) => params.delete(key));
    return url.toString();
  };
  const next = () => {
    if (props.done instanceof Function) props.done();
  };

  const addShare = (event, medium) => {
    const d = {
      uuid: uuid(),
      payload: { medium: medium },
      tracking: Url.utm(),
    };

    dispatch(event.replace("_", ":"), d, null, config);
    if (config.component.share?.anonymous === true) return;
    addAction(actionPage, event, d);
  };

  return (
    <Container component="div" maxWidth="sm" className={classes.root}>
      <EmailConfirm />
      <ConfirmPreviousStep
        prev={props.prev}
        email={config.component.consent?.email}
      />
      <h3>{t("share.title")}</h3>
      <p>{t("share.intro")}</p>
      <Card className={classes.root}>
        {config.component.share?.top && <Actions {...props} />}
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
          {!config.component.share?.top && <Actions {...props} />}
        </CardContent>
        {config.component.share?.next && (
          <Button
            endIcon={<SkipNextIcon />}
            className={classes.next}
            variant="contained"
            color="primary"
            onClick={next}
          >
            {t("Next")}
          </Button>
        )}
      </Card>
    </Container>
  );

  function Actions(props) {
    const { t } = useTranslation();
    const [data] = useData();
    const isMobile = useIsMobile();

    const shareText = (key, target) => {
      const i18nKey = [
        "campaign:" + key.replace("-", "."),
        "campaign:share.default",
        "share.message",
      ];
      let msg =
        config.param.locales[key] ||
        config.param.locales["share"] ||
        t(i18nKey);
      if (target) {
        msg += " " + target;
      }
      return msg;
    };

    let twitters = [];
    data.targets &&
      data.targets.length < 2 &&
      data.targets.forEach((d) => {
        if (d.screen_name) twitters.push("@" + d.screen_name);
      });

    let cardIcons;

    const nativeShare = (medium) => {
      addShare("share", medium);
      const url = shareUrl(medium);
      shareWebAPI(url, medium);
    };

    const shareWebAPI = (url, medium) => {
      navigator
        .share({
          text: shareText("share.default"),
          url: url,
        })
        .then(() => addShare("share_confirmed", medium))
        .catch((error) => console.error("Error sharing", error));
    };

    if (isMobile && navigator?.canShare) {
      cardIcons = (
        <CardActions>
          <Button
            endIcon={<ShareIcon />}
            className={classes.next}
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => nativeShare("webshare_api")}
          >
            {t("action.share")}
          </Button>
        </CardActions>
      );
    } else {
      cardIcons = (
        <CardActions>
          <ActionIcon
            icon={WhatsappIcon}
            title={shareText("share-whatsapp")}
            windowWidth={715}
            windowHeight={544}
            component={WhatsappShareButton}
          />
          <ActionIcon
            icon={FacebookMessengerIcon}
            title={shareText("share-fbmessenger")}
            appId="634127320642564"
            component={FacebookMessengerShareButton}
          />
          <ActionIcon icon={FacebookIcon} component={FacebookShareButton} />
          <ActionIcon
            icon={TwitterIcon}
            title={shareText("share-twitter", twitters.join(" "))}
            component={TwitterShareButton}
          />
          <ActionIcon
            icon={TelegramIcon}
            title={shareText("share-telegram")}
            component={TelegramShareButton}
          />
          {config.component.share?.email !== false &&
            i18n.exists("campaign:share.email.subject") && (
              <ActionIcon
                icon={EmailIcon}
                onClick={(e, link) => (window.location.href = link)}
                component={EmailShareButton}
                subject={t("campaign:share.email.subject", "")}
                body={shareText("share.email.body")}
                separator=" "
              />
            )}
          {!!config.component.share?.reddit && (
            <ActionIcon icon={RedditIcon} component={RedditShareButton} />
          )}
          <ActionIcon
            icon={LinkedinIcon}
            component={LinkedinShareButton}
            title={metadata.title}
            summary={shareText("share-linkedin") || metadata.description}
          />
        </CardActions>
      );
    }
    return cardIcons;
  }

  function ActionIcon(props) {
    const isMobile = useIsMobile();

    const medium = props.component.render.displayName.replace(
      "ShareButton-",
      ""
    );

    let autoClosed = true;

    function after(props) {
      console.log("autoclosed", autoClosed);
      if (autoClosed) {
        return;
      }
      addShare("share_confirmed", medium);
      autoClosed = true;
    }

    function before(props) {
      setTimeout(() => {
        console.log("timeout", autoClosed);
        autoClosed = false;
        addShare("share", medium);
      }, 1500);
    }
    let drillProps = Object.assign({}, props);
    delete drillProps.icon;
    return (
      <IconButton
        {...drillProps}
        component={props.component}
        url={shareUrl(props.component)}
        onClick={props.onClick}
        title={props.title || props.share || t("share.message")}
        beforeOnClick={() => before(props)}
        onShareWindowClose={() => after(props)}
        size={isMobile ? "small" : "medium"}
      >
        {props.icon
          ? props.icon({ round: true, size: isMobile ? 40 : 48 })
          : null}
      </IconButton>
    );
  }
}
