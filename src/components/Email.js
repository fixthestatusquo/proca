import React, { useState, useEffect, useCallback, Fragment } from "react";

import List from '@material-ui/core/List';

import TwitterAction from './TwitterAction';
import EmailAction from './EmailAction';

import Dialog from "./Dialog";
import Country from "./Country";
import useData from "../hooks/useData";
import Register from "./Register";
import { useTranslation } from "react-i18next";
import {useCampaignConfig} from "../hooks/useConfig";
import {useForm} from "react-hook-form";

const Component = props => {
  const config = useCampaignConfig();
  const [profiles, setProfiles] = useState([]);
  const [action, setAction] = useState("email");
  const Action = action==="twitter" ? TwitterAction : EmailAction;
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
          d.forEach(c => {
            if (c.country) c.country = c.country.toLowerCase();
          });
          setAllProfiles(d);
          if (!config.component.twitter?.filter.includes("country")) 
            setProfiles(d);

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


  const send=(e) => {
    const profile=profiles[0];
    let cc="";
    let s = typeof profile.subject == "function" ? profile.subject(profile): t("email.subject");

    if (profile.actionUrl) {
      if (s.indexOf("{url}") !== -1)
        s = s.replace("{url}", profile.actionUrl);
      else s = s+ " " + profile.actionUrl;
    }

    const body =t("email.body");

    for(var i = 1; i < profiles.length; i++){
      if (profiles[i].email)
        cc += profiles[i].email + ";";
    }

    var url = "mailto:"+profile.email+"?subject="+ encodeURIComponent(s)+"&cc="+cc+"&body="+encodeURIComponent(body);
    var win = window.open(
      url,
      "_blank"
    );
    
  };

  const handleDone = d => {
//no popup    viewDialog(true);
    console.log("done");
    //props.done();
  };
  //    <TwitterText text={actionText} handleChange={handleChange} label="Your message to them"/>
  return (
    <Fragment>

      <Dialog
        dialog={dialog}
        actionPage={config.actionPage}
        content={Register}
        name={config.param.dialogTitle || t("register")}
      >
        <Register actionPage={config.actionPage} />
      </Dialog>
    {config.component.twitter?.filter?.includes("country") && <Country form={form} list={config.component?.twitter?.countries}/> }
      <List>
    {profiles.map((d) =>
      <Action key={d.id} actionPage={config.actionPage} done={props.done} actionUrl={props.actionUrl || data.actionUrl} actionText={config.param.twitterText || t("twitter.actionText")} {...d}></Action>
    )}
        <Register done={handleDone} onClick={send}/>
  </List>
    </Fragment>
  );
};

export default Component;
