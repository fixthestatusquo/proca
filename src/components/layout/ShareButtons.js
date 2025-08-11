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
import { decodeHtmlEntities, pickOne } from "@lib/text";
import uuid from "@lib/uuid";
import { addAction } from "@lib/server";
import Url from "@lib/urlparser";
import dispatch from "@lib/event";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import ShareIcon from "@material-ui/icons/Share";
import { useIsMobile, mobileOS } from "@hooks/useDevice";
import useData from "@hooks/useData";
import EmailConfirm from "@components/layout/EmailConfirm";
import PreviousStepConfirm from "@components/layout/PreviousStepConfirm";
import GmailIcon from "@lib/../images/Gmail";

import {
  BlueskyShareButton,
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
  BlueskyIcon,
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
  actions: {
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  action: {
    flexGrow: 1,
  }
}));

export default function ShareAction(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const actionPage = config.actionPage;
  const { t, i18n } = useTranslation();
  const metadata = getMetadata(window.document, window.location);

  metadata.title = decodeHtmlEntities(metadata.title);
  metadata.description = decodeHtmlEntities(metadata.description);

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
  const addShare = (event, medium) => {
    const d = {
      uuid: uuid(),
      payload: { medium: medium },
      tracking: Url.utm(),
    };

    if (config.component.share?.anonymous === true) return;
    dispatch(event.replace("_", ":"), d.payload, null, config);
    addAction(actionPage, event, d, config.test);
  };

  return <Actions {...props} />;

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

      msg = pickOne(msg);
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

    const nativeShare = () => {
      const medium = "native_" + mobileOS();
      addShare("share", medium);
      const url = shareUrl(medium);
      shareWebAPI(url);
    };

    const shareWebAPI = (url) => {
      navigator
        .share({
          text: shareText("share.default"),
          url: url,
        })
        .catch(error => console.error("Error native sharing", error));
    };

    const EmailAction = () => {
      if (config.component.share?.email === false) return null;
      if (!i18n.exists("campaign:share.email.subject")) return null;

      const subject = pickOne (t("campaign:share.email.subject", ""));
      const hrefGmail = () => {
        return `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText("share.email.body"))}`;
      };

      const mailto = () => {
        window.open(hrefGmail(), "_blank");
        addShare("share", "gmail");
      };

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
          subject={subject}
          body={shareText("share.email.body")}
          separator=" "
        />
      );
    };

    cardIcons = (
      <>
        {isMobile && navigator?.canShare &&
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
                onClick={() => nativeShare()}
              >
                {t("action.share")}
              </Button>
            </CardActions>
          )}
        <CardActions className={classes.actions} disableSpacing>
          <EmailAction />

          <ActionIcon
            icon={WhatsappIcon}
            title={shareText("share-whatsapp")}
            windowWidth={715}
            windowHeight={544}
            component={WhatsappShareButton}
          />
          {config.component?.share?.messennger === true && (
            <ActionIcon
              icon={FacebookMessengerIcon}
              title={shareText("share-fbmessenger")}
              appId="634127320642564"
              component={FacebookMessengerShareButton}
            />
          )}

          {config.component?.share?.facebook !== false && (
            <ActionIcon
              icon={FacebookIcon}
              component={FacebookShareButton}
            />
          )}
          {config.component?.share?.bluesky !== false && (
            <ActionIcon
              icon={BlueskyIcon}
              title={shareText("share-twitter", twitters.join(" "))}
              component={BlueskyShareButton}
            />
          )}
          {config.component?.share?.twitter && (
            <ActionIcon
              icon={XIcon}
              title={shareText("share-twitter", twitters.join(" "))}
              component={TwitterShareButton}
            />
          )}
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
    const classes = useStyles();

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
      //      addShare("share_confirmed", medium);
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
        className={classes.action}
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
