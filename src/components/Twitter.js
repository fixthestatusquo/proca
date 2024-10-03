import React, { useState, useEffect, useCallback, Fragment } from "react";

import TwitterList from "@components/twitter/List";
import { tweet } from "@components/twitter/Action";
import Dialog from "@components/Dialog";
import ProcaAlert from "@components/Alert";
import { Alert } from "@material-ui/lab";
import Country from "@components/field/Country";
import useData from "@hooks/useData";
import Register from "@components/Register";
import Message from "@components/twitter/Message";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { pickOne, tokenize } from "@lib/text";
import { Grid, Button } from "@material-ui/core";
import TwitterIcon from "../images/Twitter.js";
import Again, { Next } from "@components/twitter/Again";
import { SvgIcon } from "@material-ui/core";
import { sample } from "@lib/array";
import ReloadIcon from "@material-ui/icons/Cached";
import { makeStyles } from "@material-ui/core/styles";
import get from "lodash/get";
import PreviousStepConfirm from "@components/layout/PreviousStepConfirm";
//TODO should be moved to widget and change logic

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
  console.log(config.component.twitter);
  if (
    config.component.twitter &&
    config.component.twitter.filter &&
    !config.component.twitter.filter.includes("random")
  )
    return null;
  if (props.total === 0) {
    return <p>Selecting your target...</p>;
  }
  return (
    <Grid container alignItems="flex-start">
      <Grid item xs={8}>
        <p>
          {t("target.random", {
            total: props.total,
            count: config.component.twitter?.sample || 1,
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
  const handleClick = (e) => {
    props.handleClick(e);
    //    if (!config.component.twitter?.filter?.includes("random")) {
    //      props.done(e);
    //    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={handleClick}
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
          <Next done={props.done} />
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
  const [allProfiles, setAllProfiles] = useState(data.targets || []);
  const [tweeting, setTweeting] = useState(false);
  const [dialog, viewDialog] = useState(false);
  const hash = data.hash || config.component.twitter?.hash;
  const sampleSize = config.component.twitter?.sample || 1;
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
    // it has a picture
    actionUrl =
      `${config.component.twitter?.metaproxy || "https://w.proca.app"}/${config.campaign.name}/${hash}?url=${encodeURIComponent(document.location.origin + document.location.pathname)}`;
  } else {
    if (!actionUrl && config.component.twitter?.actionUrl !== false) {
      actionUrl = window.location;
    }
  }

  const setMessage = useCallback(
    (profile) => {
      if (config.component.twitter?.multilingual && profile[0].locale) {
        const locale = profile[0].locale;
        const source =
          (config.component.twitter?.data &&
            data[config.component.twitter.data][locale]) ||
          {};
        const msg = get(
          source,
          config.component.twitter?.key || "campaign:twitter.message",
        );
        if (msg) {
          setValue(
            "message",
            tokenize(pickOne(msg), { profile: profile, url: actionUrl }),
          );
          return;
        }
        if (!msg && data.twitter) {
          setValue(
            "message",
            tokenize(pickOne(data.twitter), {
              profile: profile,
              url: actionUrl,
            }),
          );
          return;
        }
      }
      setValue(
        "message",
        tokenize(
          pickOne(
            data.twitter ||
              t(["campaign:twitter.message", "campaign:share.twitter"]),
          ),
          { profile: profile, url: actionUrl },
        ),
      );
    },
    [
      config.component.twitter?.data,
      config.component.twitter?.key,
      config.component.twitter?.multilingual,
      data,
      setValue,
      t,
    ],
  );

  const filterRandomProfile = useCallback(() => {
    const d = sample(allProfiles, sampleSize);
    setMessage(d);
    setProfiles(() => {
      return d;
    });
  }, [allProfiles, setMessage]);

  const randomize = config.component.twitter?.filter
    ? config.component.twitter?.filter?.includes("random")
    : true;
  useEffect(() => {
    if (!randomize) return;
    if (allProfiles.length < 2) return;
    filterRandomProfile();
  }, [randomize, allProfiles, filterRandomProfile]);

  const handleTweet = () => {
    tweet({
      actionPage: config.actionPage,
      message: form.getValues("message"),
      screen_name: profiles.map((d) => d.screen_name).join(" @"),
      actionUrl: actionUrl,
    });
    const target = data.targets ? data.targets.concat(profiles) : profiles;
    setTweeting(true);
    setData("targets", target);
  };
  const url =
    config.component.twitter?.listUrl === true ||
    !config.component.twitter?.listUrl
      ? `https://widget.proca.app/t/${config.campaign.name}.json`
      : config.component.twitter.listUrl;

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
            (c) => c.screen_name && c.screen_name.length > 0,
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
          //          filterRandom(d);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    if (data.targets) {
      const d = data.targets.filter(
        (c) => c.screen_name && c.screen_name.length > 0,
      );
      setAllProfiles(d);
      //      filterRandom(d);
    } else {
      fetchData(url);
    }
  }, [
    data.targets,
    url,
    country,
    setValue,
    setMessage,
    config.campaign.name,
    config.component,
    config.hook,
    t,
  ]);

  const filterProfiles = useCallback(
    (country) => {
      //       setProfiles(allProfiles);
      if (!country) return;
      country = country.toLowerCase();
      const profiles = allProfiles.filter((d) => {
        return (
          d.country === country ||
          (d.country === "") | (d.constituency?.country === country)
        );
      });
      console.warn("do we filter profile?", profiles.length);
      //setProfiles(profiles);
    },
    [allProfiles],
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
  /*
  useEffect(() => {
    //    setFilter({country:config.country});
    filterProfiles(country);
  }, [country, filterProfiles]);
*/
  const handleDone = () => {
    if (config.component.twitter?.anonymous === true) return;
    if (!data.firstname) viewDialog(true);
  };

  const handleClose = () => {
    viewDialog(false);
  };

  console.log("filter", props.country, config.component.twitter?.filter);
  const FirstStep = (props) => {
    return (
      <>
        <PreviousStepConfirm email={config.component.consent?.email} />
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
        <Message form={form} />
        {hash && <ShowCard hash={hash} />}
        <TweetButton handleClick={handleTweet} done={props.done} />
      </>
    );
  };

  const ShowCard = (props) => {
    const classes = useStyles();
    const image =
      `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/picture/${config.campaign.name}/${props.hash}.jpg`;
    return (
      <img
        src={image}
        alt="generated by the supporter"
        className={classes.media}
      />
    );
  };
  //          "addLink": true,
  //          "showCard": true

  const SecondStep = () => {
    if (!tweeting) return null;
    if (
      profiles.length === allProfiles.length &&
      !config.component.twitter?.filter?.includes("random")
    ) {
      return (
        <>
          <Alert severity="info">{t("twitter.instruction")}</Alert>
          <Next done={props.done} />
        </>
      );
    }
    return (
      <>
        <Again
          again={() => {
            filterRandomProfile();
            setTweeting(false);
          }}
          done={props.done}
        />
        <ProcaAlert severity="info">
          {t(
            "twitter.instruction",
            "Please complete sending the tweet in the new window (on twitter.com)",
          )}
        </ProcaAlert>
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
      {!tweeting && <FirstStep done={props.done} profiles={profiles} />}
      {tweeting && <SecondStep done={props.done} />}
    </Fragment>
  );
};

export default Component;
