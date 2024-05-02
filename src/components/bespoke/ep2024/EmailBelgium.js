import React, { useState, useEffect } from "react";
import Email from "@components/Email";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import ProgressCounter from "@components/ProgressCounter";
import { Container } from "@material-ui/core";
import AreaFilter from "@components/bespoke/ep2024/filter/Belgium";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

const EmailBrussels = (props) => {
  const { t } = useTranslation();
  const [allProfiles, setAllProfiles] = useState([]);
  let profiles = [];
  const constituencyState = useState(null);
  const votationState = useState({
    region: {
      label: "Regional",
      selected: true,
    },
    state: {
      label: "Federal",
      selected: true,
    },
    europe: {
      label: "Europe",
      selected: true,
    },
  });
  const config = useCampaignConfig();
  const form = useForm({
    mode: "onBlur",
    //    nativeValidation: true,
  });
  useEffect(() => {
    const prefetch = async (url) => {
      await fetch(url);
    };
    prefetch("https://static.proca.app/ep2024/parties.json");
  }, []);
  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.error();
      const d = await res.json();
      let languages = [];
      d.forEach((c) => {
        if (c.locale && !languages.includes(c.locale)) {
          languages.push(c.locale);
        }
        if (c.country) c.country = c.country.toLowerCase();
      });
      setAllProfiles(d);
    };
    try {
      const url =
        typeof config.component.email?.listUrl === "string"
          ? config.component.email.listUrl
          : "https://widget.proca.app/t/" + config.campaign.name + ".json";

      fetchData(url);
    } catch (error) {
      const placeholder = {
        name: error.toString(),
        description: "Please check your internet connection and try later",
      };
      setAllProfiles([placeholder]);
    }
  }, [config.component, setAllProfiles]);

  const [constituency] = constituencyState;
  const [votations] = votationState;

  const locales = { vl: "nl", wal: "fr", bru_fr: "fr", bru_nl: "nl" };
  const filter = (d) => {
    const lang = locales[constituency];
    if (lang !== d.lang) return false;

    if (votations.state.selected && d.constituency === "be") {
      return true;
    }
    if (votations.europe.selected && d.constituency === "EU") {
      return true;
    }
    const t = d.constituency.substring(0, 3);
    if (votations.region.selected && d.constituency === t) {
      return true;
    }

    return false;
  };

  if (constituency) {
    profiles = allProfiles.filter(filter);
  }
  console.log("profiles", profiles.length, constituency);

  return (
    <Container maxWidth="sm">
      <ProgressCounter actionPage={config.actionPage} />
      <AreaFilter
        form={form}
        country={props.country}
        constituencyState={constituencyState}
        votationState={votationState}
      />
      {profiles.length ? (
        <Email {...props} targets={profiles} />
      ) : (
        <Alert severity="info">
          {t("campaign:constituency.empty", "Select your constituency")}
        </Alert>
      )}
    </Container>
  );
};

export default EmailBrussels;
