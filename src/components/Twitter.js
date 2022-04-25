import React, { useState, useEffect, useCallback, Fragment } from "react";

import TwitterList from "@components/twitter/List";
import Dialog from "@components/Dialog";
import Country from "@components/Country";
import useData from "@hooks/useData";
import Register from "@components/Register";
import Message from "@components/twitter/Message";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import {pickOne} from '@lib/text';
import { Grid, Button } from "@material-ui/core";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import TwitterIcon from '../images/Twitter.js';
import SvgIcon from '@material-ui/core/SvgIcon';
import ReloadIcon from '@material-ui/icons/Cached';
const Intro = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  if (!config.component.twitter?.filter?.includes("random"))
    return null;
  if (props.total === 0) {
    return (<p>Selecting your target...</p>);
  }
  return (
    <Grid container alignItems="flex-start">
    <Grid item xs={8}>
        <p>{t("Selected one of our {{total}} most important targets",{total:props.total})}</p>
    </Grid>
        <Grid item xs={4} justifyContent="flex-end" alignContent="flex-end">

        <Button
                variant="contained"
                startIcon={
                  <ReloadIcon />
                }
          onClick = {props.handleClick}
        >Another</Button>
        </Grid>
    </Grid>
      )
}

const TweetButton = props => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  return (
            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                onClick={props.handleClick}
                size="large"
                endIcon={
                    <SvgIcon><TwitterIcon /></SvgIcon>
                }
              >
    {t(config.component.tweet?.button || "Tweet")}
              </Button>
              {config.component.twitter?.next && (
                <Button
                  endIcon={<SkipNextIcon />}
                  variant="contained"
                  onClick={props.done}
                >
                  {t("Next")}
                </Button>
              )}
            </Grid>
  );
}

const Component = (props) => {
  const { t, i18n } = useTranslation();
  const config = useCampaignConfig();
  const [profiles, setProfiles] = useState([]);
  const [data] = useData();
  const [allProfiles, setAllProfiles] = useState([]);
  const [dialog, viewDialog] = useState(false);
  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: {...data,message:pickOne(t("campaign:twitter.message"))},
  });
  const { watch } = form;
  const country = watch("country");
  let actionUrl = props.actionUrl || data?.actionUrl;
  if (!actionUrl && i18n.exists("twitter.actionUrl"))
    actionUrl = t("twitter.actionUrl"); /* i18next-extract-disable-line */

  useEffect(() => {
    const fetchData = async (url) => {
      await fetch(url)
        .then((res) => {
          if (!res.ok) throw res.error();
          return res.json();
        })
        .then((d) => {
          if (
            config.hook &&
            typeof config.hook["twitter:load"] === "function"
          ) {
            config.hook["twitter:load"](d);
          }
          d.forEach((c) => {
            if (c.country) c.country = c.country.toLowerCase();
          });
          setAllProfiles(d);
          if (config.component.twitter?.filter?.includes("random")) {
            const i = d[Math.floor(Math.random() * d.length)];
            setProfiles([i]);
          } else if (!config.component.twitter.filter?.includes("country")) {
            setProfiles(d);
          }
        })

        .catch((error) => {
          console.log(error);
        });
    };
    if (config.component.twitter.listUrl)
      fetchData(config.component.twitter.listUrl);
  }, [config.component, config.hook, setAllProfiles]);

  const filterRandomProfile = () => {
      const d = allProfiles;
            const i = d[Math.floor(Math.random() * d.length)];
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
    [allProfiles]
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
    viewDialog(true);
  };

  const handleClose = (d) => {
    viewDialog(false);
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
      {config.component.twitter?.filter?.includes("country") && (
        <Country form={form} list={config.component?.twitter?.countries} />
      )}
    <Intro total={allProfiles.length} handleClick={filterRandomProfile}/>
      <TwitterList
        profiles={profiles}
        actionPage={props.actionPage}
        actionUrl={actionUrl}
        form={form}
        done={handleDone}
      />
      {config.component.twitter?.message && (<Message form={form}  />)}
    <TweetButton />
    </Fragment>
  );
};

export default Component;
