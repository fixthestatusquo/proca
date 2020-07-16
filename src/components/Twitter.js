import React, { useState, useEffect, useCallback, Fragment } from "react";

import TwitterList from "./TwitterList";
import Dialog from "./Dialog";
import Country from "./Country";
import Register from "./Register";
import useConfig from "../hooks/useConfig";
import { useTranslation } from "react-i18next";

const Component = props => {
  const [profiles, setProfiles] = useState([]);
//  const [filter, setFilter] = useState({country:null});
  const [allProfiles, setAllProfiles] = useState([]);
  const [dialog, viewDialog] = useState(false);
  const { config } = useConfig();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async url => {
      await fetch(url)
        .then(res => {
          if (!res.ok) throw res.error();
          return res.json();
        })
        .then(d => {
          if (typeof config.hook["twitter:load"] === "function") {
            config.hook["twitter:load"](d);
          }
          setAllProfiles(d);
        })
        .catch(error => {
          console.log(error);
        });
    };

    if (props.targets.twitter_url) 
      fetchData(props.targets.twitter_url);
  }, [props.targets.twitter_url, config.hook, setAllProfiles]);

  const filterProfiles = useCallback ( country => {
      //       setProfiles(allProfiles);
    if (!country) return;
    country = country.toLowerCase();
    const d = allProfiles.filter(d => {
      return d.country === country || d.country === "";
    });
    setProfiles(d);
  },[allProfiles]);

  useEffect(() => {
//    setFilter({country:config.country});
    filterProfiles(config.country);
/*    if (typeof config.hook["twitter:load"] === "function") {
      let d = allProfiles;
      config.hook["twitter:load"](d);
      setProfiles(d);
    }*/

  },[config.country,filterProfiles]);


  const handleDone = d => {
    viewDialog(true);
  };
  //    <TwitterText text={actionText} handleChange={handleChange} label="Your message to them"/>
  return (
    <Fragment>
      <Dialog
        dialog={dialog}
        actionPage={props.actionPage}
        content={Register}
        name={config.param.dialogTitle || t("Let's keep in touch")}
      >
        <Register actionPage={props.actionPage} />
      </Dialog>
      <Country />
      <TwitterList
        profiles={profiles}
        actionPage={props.actionPage}
        actionUrl={config.param.actionUrl || props.actionUrl}
        actionText={config.param.twitterText || props.actionText}
        done={handleDone}
      />
    </Fragment>
  );
};

Component.defaultProps = {
  actionText: ".{@} you should check that!"
};
export default Component;
