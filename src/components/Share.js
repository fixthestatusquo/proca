import React from "react";

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
  Avatar,
} from "@material-ui/core";
import { getMetadata } from "page-metadata-parser";
import { decodeHtmlEntities } from "@lib/text";
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
import EmailConfirm from "@components/layout/EmailConfirm";
import PreviousStepConfirm from "@components/layout/PreviousStepConfirm";
import GmailIcon from "../images/Gmail";

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
  XIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  EmailIcon,
} from "react-share";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  emailIcon: {
    cursor: "pointer",
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundColor: "#eee",
  },
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

export default function ShareAction(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const actionPage = config.actionPage;
  const metadata = getMetadata(window.document, window.location);
  const { t, i18n } = useTranslation();

  const shareUrl = component => {
    // the share by email is assumed to have the url already set in the body, skip adding it as a footer of the message
    if (
      component.render?.displayName &&
      component.render.displayName.includes("email")
    )
      return "";
    const medium =
      typeof component === "string"
        ? component
        : component.render.displayName.replace("ShareButton-", "");
    const url = new URL(config.component?.share?.url || window.location.href);
    const params = url.searchParams;
    if (config.component.share?.compact !== false) {
      params.set("utm", `.share.${medium}`);
    } else {
      params.set("utm_source", "share");
      params.set("utm_medium", medium);
      //  params.set("utm_campaign", uuid());
      params.set("utm_campaign", "proca");
    }
    const garbage = [];
    for (const key of params.keys()) {
      if (key === "doi") garbage.push(key);
      if (key.startsWith("proca_")) garbage.push(key);
    }
    if (
      config.component.share?.utm === false ||
      config.component.share?.compact
    ) {
      ["utm_source", "utm_medium", "utm_campaign"].forEach(d =>
        garbage.push(d)
      );
    }
    garbage.forEach(key => params.delete(key));
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
    addAction(actionPage, event, d, config.test);
  };

  metadata.title = decodeHtmlEntities(metadata.title);
  metadata.description = decodeHtmlEntities(metadata.description);
  return (
    <Container component="div" maxWidth="sm" className={classes.root}>
      <EmailConfirm />
      <PreviousStepConfirm email={config.component.consent?.email} />
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
        </CardContent>
        {!config.component.share?.top && <Actions {...props} />}
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

  function Actions() {
    const { t } = useTranslation();
    const [data] = useData();
    const isMobile = useIsMobile();

    const shareText = (key, target) => {
      const i18nKey = [
        `campaign:${key.replace("-", ".")}`,
        "campaign:share.default",
        "share.message",
      ];
      let msg =
        config.param.locales[key] ||
        config.param.locales["share"] ||
        /* i18next-extract-disable-line */ t(i18nKey);
      if (target) {
        msg += ` ${target}`;
      }
      return msg;
    };

    const twitters = [];
    data.targets &&
      data.targets.length < 2 &&
      data.targets.forEach(d => {
        if (d.screen_name) twitters.push(`@${d.screen_name}`);
      });

    let cardIcons;

    const nativeShare = medium => {
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
        .catch(error => console.error("Error sharing", error));
    };

    const EmailAction = () => {
      const hrefGmail = () => {
        return `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(t("campaign:share.email.subject", ""))}&body=${encodeURIComponent(shareText("share.email.body"))}`;
      };

      const mailto = () => {
        window.open(hrefGmail(), "_blank");
        addShare("share", "gmail");
      };
      if (config.component.share?.email === false) return null;
      if (!i18n.exists("campaign:share.email.subject")) return null;

      if (
        data.email?.includes("@gmail") ||
        data.emailProvider === "google.com"
      ) {
        //      if (data.email?.includes("@gmail")) {
        return (
          <Avatar
            title={t("campaign:share.email.subject", "")}
            onClick={mailto}
            className={classes.emailIcon}
          >
            <GmailIcon />
          </Avatar>
        );
      }
      return (
        <ActionIcon
          icon={EmailIcon}
          component={EmailShareButton}
          subject={t("campaign:share.email.subject", "")}
          body={shareText("share.email.body")}
          separator=" "
        />
      );
    };

    cardIcons = (
      <>
        {isMobile &&
          navigator?.canShare &&
          !(
            config.component.share?.native &&
            config.component.share.native === false
          ) && (
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
          )}
        <CardActions>
          <EmailAction />

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
            icon={XIcon}
            title={shareText("share-twitter", twitters.join(" "))}
            component={TwitterShareButton}
          />
          <ActionIcon
            icon={TelegramIcon}
            title={shareText("share-telegram")}
            component={TelegramShareButton}
          />
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
      </>
    );
    return cardIcons;
  }

  function ActionIcon(props) {
    const isMobile = useIsMobile();

    const medium = props.component.render.displayName.replace(
      "ShareButton-",
      ""
    );

    let autoClosed = true;

    function after() {
      console.log("autoclosed", autoClosed);
      if (autoClosed) {
        return;
      }
      addShare("share_confirmed", medium);
      autoClosed = true;
    }

    function before() {
      setTimeout(() => {
        console.log("timeout", autoClosed);
        autoClosed = false;
        addShare("share", medium);
      }, 1500);
    }

    const drillProps = Object.assign({}, props);
    delete drillProps.icon;
    const openShareDialogOnClick = config.component.share
      ? config.component?.share.open !== false
      : undefined;

    const onClick = (e, link) => {
      if (props.onClick) {
        props.onClick(e, link);
        return;
      }
      if (openShareDialogOnClick === false) window.location.href = link;
    };

    return (
      <IconButton
        {...drillProps}
        id={`proca-share-${medium}`}
        component={props.component}
        url={shareUrl(props.component)}
        openShareDialogOnClick={openShareDialogOnClick}
        onClick={onClick}
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
