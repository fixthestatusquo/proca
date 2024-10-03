import React, { useState, useEffect, useCallback, Fragment } from "react";

import List from "@material-ui/core/List";
import MepAction from "@components/MepAction";
import Dialog from "@components/Dialog";
import Country from "@components/field/Country";
import useData from "@hooks/useData";
import Register from "@components/Register";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";

const Component = props => {
  const config = useCampaignConfig();
  const [profiles, setProfiles] = useState([]);
  const [consentAsked, setAsked] = useState(false);
  const [data] = useData();

  //  const [filter, setFilter] = useState({country:null});
  const [allProfiles, setAllProfiles] = useState([]);
  const [dialog, viewDialog] = useState(false);
  const { t } = useTranslation();
  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: data,
  });
  const { watch } = form;
  const country = watch("country");

  const sortProfiles = (d, committee) => {
    const roleWeight = { Substitute: 1, Member: 3, "Vice-Chair": 5, Chair: 8 };
    const getWeight = c => {
      let weight = 0;
      for (let i = 0; i < c.length; i++) {
        if (committee.includes(c[i].name)) {
          weight += roleWeight[c[i].role];
        }
      }
      return weight;
    };
    d.sort((a, b) => {
      if (committee) {
        const weightA = getWeight(a.committees);
        const weightB = getWeight(b.committees);
        // first chairs and big wigs
        if (weightA > weightB) return false;
        if (weightA < weightB) return true;
        // in case of equal weight, continue and alpha sort
      }
      if (a.last_name > b.last_name) return true;
      return false;
    });
  };
  useEffect(() => {
    const fetchData = async url => {
      await fetch(url)
        .then(res => {
          if (!res.ok) throw res.error();
          return res.json();
        })
        .then(d => {
          if (
            config.hook &&
            typeof config.hook["twitter:load"] === "function"
          ) {
            config.hook["twitter:load"](d);
          }
          if (config?.component?.Ep?.filter) {
            const committee = config.component.Ep.filter.committee;
            const profiles = d.filter(meps => {
              for (let i = 0; i < meps.committees.length; i++) {
                if (committee.includes(meps.committees[i].name)) return true;
              }
              return false;
            });
            sortProfiles(profiles, committee);
            setAllProfiles(profiles);
            return;
          }
          sortProfiles(d);
          setAllProfiles(d);
        })
        .catch(error => {
          console.log(error);
        });
    };
    if (config.component?.twitter?.listUrl)
      fetchData(config.component.twitter.listUrl);
    else fetchData("https://www.tttp.eu/data/meps.json");
  }, [config.component, config, setAllProfiles]);

  const filterProfiles = useCallback(
    country => {
      //       setProfiles(allProfiles);
      if (!country) return;
      country = country.toLowerCase();
      const d = allProfiles.filter(d => {
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

  const handleDone = () => {
    if (!consentAsked) {
      viewDialog(true);
      setAsked(true);
    }
  };
  const handleClose = () => {
    viewDialog(false);
  };
  //    <TwitterText text={actionText} handleChange={handleChange} label="Your message to them"/>
  return (
    <Fragment>
      <Dialog
        dialog={dialog}
        actionPage={props.actionPage}
        close={handleClose}
        content={Register}
        buttonText={t("register")}
        name={config.param.dialogTitle || t("dialogTitle")}
      >
        <Register actionPage={props.actionPage} />
      </Dialog>
      <Country form={form} />
      <List>
        {profiles.map(d => (
          <MepAction
            key={d.epid}
            actionPage={props.actionPage}
            done={handleDone}
            actionUrl={data.actionUrl}
            actionText={props.TwitterActionText || t("twitter.actionText")}
            {...d}
          />
        ))}
      </List>
    </Fragment>
  );
};

Component.defaultProps = {
  actionText: ".{@} you should check that!",
};
export default Component;
