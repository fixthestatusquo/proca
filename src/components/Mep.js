import React, { useState, useEffect, useCallback, Fragment } from "react";

import MepAction from "./MepAction";
import Dialog from "./Dialog";
import Country from "./Country";
import useData from "../hooks/useData";
import Register from "./Register";
import { useTranslation } from "react-i18next";
import {useCampaignConfig} from "../hooks/useConfig";
import useForm from "react-hook-form";

const Component = props => {
  const config = useCampaignConfig();
  const [profiles, setProfiles] = useState([]);
  const [data,] = useData();

//  const [filter, setFilter] = useState({country:null});
  const [allProfiles, setAllProfiles] = useState([]);
  const [dialog, viewDialog] = useState(false);
  const { t } = useTranslation();
  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: data
  });
  const {watch}=form;
  const country=watch("country");

  useEffect(() => {
    const fetchData = async url => {
      await fetch(url)
        .then(res => {
          if (!res.ok) throw res.error();
          return res.json();
        })
        .then(d => {
          if (config.hook && typeof config.hook["twitter:load"] === "function") {
            config.hook["twitter:load"](d);
          }
          setAllProfiles(d);
        })
        .catch(error => {
          console.log(error);
        });
    };
    if (config.component?.twitter?.listUrl) 
      fetchData(config.component.twitter.listUrl);
  }, [config.component, config.hook, setAllProfiles]);

  const filterProfiles = useCallback ( country => {
      //       setProfiles(allProfiles);
    if (!country) return;
    country = country.toLowerCase();
    const d = allProfiles.filter(d => {
      return d.country === country || d.country === "" | d.constituency?.country === country;
    });
    setProfiles(d);
  },[allProfiles]);

  useEffect(() => {
//    setFilter({country:config.country});
    filterProfiles(country);
/*    if (typeof config.hook["twitter:load"] === "function") {
      let d = allProfiles;
      config.hook["twitter:load"](d);
      setProfiles(d);
    }*/

  },[country,filterProfiles]);


  const handleDone = d => {
    console.log ("close");
    viewDialog(true);
  };
  //    <TwitterText text={actionText} handleChange={handleChange} label="Your message to them"/>
  return (
    <Fragment>
      <Dialog
        dialog={dialog}
        actionPage={props.actionPage}
        content={Register}
        name={t("register")}
      >
        <Register actionPage={props.actionPage} />
      </Dialog>
      <Country form={form}/>
      <List>
    {profiles.map((d) =>
      <MepAction key={d.epid} actionPage={actionPage} done={handleDone} actionUrl={actionUrl} actionText={actionText} {...d}></MepAction>
    )}
  </List>

    </Fragment>
  );
};

Component.defaultProps = {
  actionText: ".{@} you should check that!"
};
export default Component;
