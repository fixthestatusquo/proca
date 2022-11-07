import React, { useState, useEffect, useCallback, Fragment } from "react";

import TwitterList from "@components/twitter/List";
import { tweet } from "@components/twitter/Action";
import Dialog from "@components/Dialog";
import Alert from "@components/Alert";
import Country from "@components/Country";
import useData from "@hooks/useData";
import Register from "@components/Register";
import Message from "@components/twitter/Message";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { pickOne, tokenize } from "@lib/text";
import { Grid, Button } from "@material-ui/core";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import TwitterIcon from "../images/Twitter.js";
import Again from "@components/twitter/Again";
import { SvgIcon } from "@material-ui/core";
import ReloadIcon from "@material-ui/icons/Cached";
import { makeStyles } from "@material-ui/core/styles";
import { get } from "lodash";
const useStyles = makeStyles((theme) => ({
  skip: {
    marginTop: theme.spacing(1),
  },
  media: {
    width: "100%",
  },
}));

const Intro = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  if (!config.component.twitter?.filter?.includes("random")) return null;
  if (props.total === 0) {
    return <p>Selecting your target...</p>;
  }
  return (
    <Grid container alignItems="flex-start">
      <Grid item xs={8}>
        <p>
          {t("target.random", {
            total: props.total,
          })}
        </p>
      </Grid>
      <Grid item xs={4}>
        <Button
          variant="contained"
          startIcon={<ReloadIcon />}
          onClick={props.handleClick}
        >
          {t("Another")}
        </Button>
      </Grid>
    </Grid>
  );
};

const TweetButton = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const classes = useStyles();
  return (
    <>
      <Grid item xs={12}>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={props.handleClick}
          size="large"
          endIcon={
            <SvgIcon>
              <TwitterIcon />
            </SvgIcon>
          }
        >
          {t(config.component.tweet?.button || "Tweet")}
        </Button>
      </Grid>
      {config.component.twitter?.skip && (
        <Grid item xs={12} className={classes.skip}>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            endIcon={<SkipNextIcon />}
            onClick={props.done}
          >
            {t(
              config.component.twitter?.next
                ? config.component.twitter.next
                : "Next"
            )}
          </Button>
        </Grid>
      )}
    </>
  );
};

const Component = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [profiles, setProfiles] = useState([]);
  const [data, setData] = useData();
  const [allProfiles, setAllProfiles] = useState([]);
  const [tweeting, setTweeting] = useState(false);
  const [dialog, viewDialog] = useState(false);
  let hash = data.hash;

  const form = useForm({
    defaultValues: {
      ...data,
      message: "",
    },
  });
  const { watch, setValue } = form;
  const country = watch("country");

  let actionUrl = props.actionUrl || data?.actionUrl; // || window.location.href;
  if (hash) {
    // it's a meme
    actionUrl =
      "https://meme.fixthestatusquo.org/meme/" +
      data.hash +
      "?url=" +
      encodeURIComponent(document.location.origin + document.location.pathname);
  }
  const handleTweet = () => {
    tweet({
      actionPage: config.actionPage,
      message: form.getValues("message"),
      screen_name: profiles.map((d) => d.screen_name).join(","),
      actionUrl: actionUrl,
    });
    let target = data.targets ? data.targets.concat(profiles) : profiles;
    setTweeting(true);
    setData("targets", target);
  };
  const url =
    config.component.twitter?.listUrl === true
      ? "https://widget.proca.app/t/" + config.campaign.name + ".json"
      : config.component.twitter.listUrl;

  const setMessage = useCallback(
    (profile) => {
      if (config.component.twitter.multilingual && profile[0].locale) {
        const locale = profile[0].locale;
        const source =
          (config.component.twitter.data &&
            data[config.component.twitter.data][locale]) ||
          {};
        const msg = get(source, config.component.twitter.key);

        if (msg) {
          setValue("message", tokenize(pickOne(msg), { profile: profile }));
          return;
        }
      }
      setValue(
        "message",
        tokenize(
          pickOne(t(["campaign:twitter.message", "campaign:share.twitter"])),
          { profile: profile }
        )
      );
    },
    [
      config.component.twitter.data,
      config.component.twitter.key,
      config.component.twitter.multilingual,
      data,
      setValue,
      t,
    ]
  );

  useEffect(() => {
    const fetchData = async (url) => {
      await fetch(url)
        .then((res) => {
          if (!res.ok) throw res.error();
          return res.json();
        })
        .then((targets) => {
          if (
            config.hook &&
            typeof config.hook["twitter:load"] === "function"
          ) {
            config.hook["twitter:load"](targets);
          }
          let d = targets.filter(
            (c) => c.screen_name && c.screen_name.length > 0
          );
          d.forEach((c) => {
            if (c.country) c.country = c.country.toLowerCase();
          });
          // if the country of the visitor is set, filter the list of targets
          if (country) {
            const country2l = country.toLowerCase();
            const filtered = d.filter((c) => c.country === country2l);
            if (filtered.length > 0) d = filtered;
          }

          setAllProfiles(d);
          if (config.component.twitter?.filter?.includes("random")) {
            const i = d[Math.floor(Math.random() * d.length)];
            setMessage([i]);
            setProfiles([i]);
          } else {
            //if (!config.component.twitter.filter?.includes("country")) {
            setProfiles(d);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchData(url);
  }, [
    url,
    country,
    setValue,
    setMessage,
    config.campaign.name,
    config.component,
    config.hook,
    t,
  ]);

  // eslint-disable-next-line
  const filterRandomProfile = () => {
    const d = allProfiles;
    const i = d[Math.floor(Math.random() * d.length)];
    setMessage([i]);
    setProfiles([i]);
  };

  const filterProfiles = useCallback(
    (country) => {
      //       setProfiles(allProfiles);
      if (!country) return;
      country = country.toLowerCase();
      const d = allProfiles.filter((d) => {
        return (
          d.country === country ||
          (d.country === "") | (d.constituency?.country === country)
        );
      });
      setProfiles(d);
    },
    [allProfiles],
    []
  );

  useEffect(() => {
    //    setFilter({country:config.country});
    filterProfiles(country);
    /*    if (typeof config.hook["twitter:load"] === "function") {
      let d = allProfiles;
      config.hook["twitter:load"](d);
      setProfiles(d);
    }*/
  }, [country, filterProfiles]);

  const handleDone = (d) => {
    if (config.component.twitter?.anonymous === true) return;
    if (!data.firstname) viewDialog(true);
  };

  const handleClose = (d) => {
    viewDialog(false);
  };

  const FirstStep = (props) => {
    return (
      <>
        {config.component.twitter?.filter?.includes("country") && (
          <Country form={form} list={config.component?.twitter?.countries} />
        )}
        <Intro total={allProfiles.length} handleClick={filterRandomProfile} />
        <TwitterList
          profiles={profiles}
          actionPage={props.actionPage}
          actionUrl={actionUrl}
          form={form}
          clickable={config.component.twitter?.clickable}
          done={handleDone}
        />
        {config.component.twitter?.message && <Message form={form} />}
        {hash && <ShowCard hash={hash} />}
        <TweetButton handleClick={handleTweet} done={props.done} />
      </>
    );
  };

  const ShowCard = (props) => {
    const classes = useStyles();
    const image =
      process.env.REACT_APP_SUPABASE_URL +
      "/storage/v1/object/public/together4forests/meme/" +
      props.hash +
      ".jpeg";
    return <img src={image} alt="meme" className={classes.media} />;
  };
  //          "addLink": true,
  //          "showCard": true

  const SecondStep = () => {
    if (!tweeting) return null;

    return (
      <>
        <Again
          again={() => {
            filterRandomProfile();
            setTweeting(false);
          }}
          done={props.done}
        />
        <Alert severity="info">
          {t(
            "twitter.instruction",
            "Please complete sending the tweet in the new window (on twitter.com)"
          )}
        </Alert>
      </>
    );
  };

  return (
    <Fragment>
      <Dialog
        dialog={dialog}
        actionPage={props.actionPage}
        close={handleClose}
        content={Register}
        buttonText={config.param.register}
        name={config.param.dialogTitle || t("dialogTitle")}
      >
        <Register actionPage={props.actionPage} done={props.done} />
      </Dialog>
      {!tweeting && <FirstStep done={props.done} />}
      {tweeting && <SecondStep done={props.done} />}
    </Fragment>
  );
};

export default Component;
