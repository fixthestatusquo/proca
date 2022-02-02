import React, { useState, useEffect, useCallback } from "react";

import List from "@material-ui/core/List";

import EmailAction from "@components/EmailAction";
import ProgressCounter from "@components/ProgressCounter";

import Country from "@components/Country";
import useData from "@hooks/useData";
import useToken, {extractTokens} from "@hooks/useToken";
import { useIsMobile } from "@hooks/useDevice";
import Register from "@components/Register";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { Grid, Container } from "@material-ui/core";
import TextField from "@components/TextField";

import uuid from "@lib/uuid";
import {getCountryName} from "@lib/i18n";
import { addAction } from "@lib/server";

const Component = (props) => {
  const config = useCampaignConfig();
  const [profiles, setProfiles] = useState([]);
  const [data, setData] = useData();
  //  const [filter, setFilter] = useState({country:null});
  const [allProfiles, setAllProfiles] = useState([]);
  const isMobile = useIsMobile();

  const { t } = useTranslation();

  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: data,
  });
  const { watch, getValues, setValue, setError, clearErrors } = form;

  const country = watch ("country");
  const fields = getValues (["subject","message"]);

  const tokenKeys = extractTokens (data["message"]);
  const tokens = watch (tokenKeys);
  const handleMerging = text => {
    setValue("message",text);
  };

  if (tokenKeys.includes ("targets"))
    tokens.targets=profiles;
  useToken (data["message"],tokens, handleMerging); 
  // # todo more reacty, use the returned value instead of the handleMerging callback


  useEffect( () => { // not clear what it does, todo
    ["subject","message"].map ( k => {
      if (data[k] && !fields[k]) {
        if (tokenKeys.length) { // there are token in the message
          const empty = {};
          tokenKeys.forEach ( d => (empty[d] = '' ));
          form.setValue(k,t(data[k],empty));
        } else {
          form.setValue(k,data[k]);
        }
      }
      return undefined;
    }); // eslint-disable-next-line
  },[{firstname:tokens.firstname, country: tokens.country ? getCountryName(tokens.country):""},fields,form]);
  // todo: clean the dependency
  //
  useEffect(() => {
    const fetchData = async (url) => {
      await fetch(url)
        .then((res) => {
          if (!res.ok) throw res.error();
          return res.json();
        })
        .then((d) => {
          if (config.hook && typeof config.hook["email:load"] === "function") {
            config.hook["email:load"](d);
          }
          d.forEach((c) => {
            if (c.country) c.country = c.country.toLowerCase();
          });
          setAllProfiles(d);
          if (!config.component.email?.filter?.includes("country"))
            setProfiles(d);
        })
        .catch((error) => {
          const placeholder = {name:error.toString(),description:"Please check your internet connection and try later"};
          setProfiles([placeholder]);
          setAllProfiles([placeholder]);
        });
    };
    if (config.component?.email?.listUrl) {
      fetchData(config.component.email.listUrl);
    } else {
      const emails =
        typeof config.component.email.to === "string"
          ? config.component.email.to?.split(",")
          : [];
      let to = [];
      emails.map((d) => {
        return to.push({ email: d.trim() });
      });
//      console.log(to);
      setAllProfiles(to);
      setProfiles(to);
    }// eslint-disable-next-line 
  }, [config.component, config.hook, setAllProfiles]);

  const filterProfiles = useCallback(
    (country) => {
      if (!country) return;
      country = country.toLowerCase();
      const d = allProfiles.filter((d) => {
        return (
          d.country === country ||
          (d.country === "") | (d.constituency?.country === country)
        );
      });
      // display error if empty
      //    <p>{t("Select another country, there is no-one to contact in {{country}}",{country:country})}</p>
      if (d.length === 0) {
        setError("country",{message:t("target.country.empty",{country:getCountryName(country)}),type:"no_empty"});
      } else {
        clearErrors("country");
      }
      setProfiles(d);
      setData("targets",d);
      setData("country",country);
    },
    [allProfiles,setError,clearErrors,t, setData]
  );

  useEffect(() => {
    
    filterProfiles(country);

  }, [country, filterProfiles]);

  const send = (data) => {
    const hrefGmail = (message) => {
      return (
        "https://mail.google.com/mail/?view=cm&fs=1&to=" +
        message.to +
        "&su=" +
        message.subject +
        (message.cc ? "&cc=" + message.cc : "") +
        (message.bcc ? "&bcc=" + message.bcc : "") +
        "&body=" +
        message.body
      );
    };

    const profile = profiles[0] || { subject: null };
    let to = [];
    let cc = null;
    const bcc = config.component.email?.bcc;
    let s =
      typeof profile.subject == "function"
        ? profile.subject(profile)
        : t("email.subject");

    if (profile.actionUrl) {
      if (s.indexOf("{url}") !== -1) s = s.replace("{url}", profile.actionUrl);
      else s = s + " " + profile.actionUrl;
    }

    const body = t("email.body");

    for (var i = 0; i < profiles.length; i++) {
      if (profiles[i].email) to.push(profiles[i].email);
    }
    to = to.join(";");

    if (config.component.email?.cc === true) {
      cc = to;
      to = null;
    }
    if (
      config.component.email?.to &&
      typeof config.component.email.to === "string"
    ) {
      to = config.component.email.to;
    }
    const url =
      !isMobile && data.email.includes("@gmail")
        ? hrefGmail({
            to: to,
            subject: encodeURIComponent(s),
            cc: cc,
            bcc: bcc,
            body: encodeURIComponent(body),
          })
        : "mailto:" +
          to +
          "?subject=" +
          encodeURIComponent(s) +
          (cc ? "&cc=" + cc : "") +
          (bcc ? "&bcc=" + bcc : "") +
          "&body=" +
          encodeURIComponent(body);

    var win = window.open(url, "_blank");
    //TODO: display fallback using  Clipboard.writeText()
    var timer = setInterval(() => {
      if (!win) {
        addAction(config.actionPage, "email_blocked", { uuid: uuid() });
        clearInterval(timer);
        return;
      }
      if (win.closed) {
        addAction(config.actionPage, "email_close", {
          uuid: uuid(),
          //        tracking: Url.utm(),
          payload: [],
        });
        clearInterval(timer);
        props.done();
      }
    }, 1000);
  };

  //    <TwitterText text={actionText} handleChange={handleChange} label="Your message to them"/>
  //
  const ExtraFields = props => {
    return (<>
      {config.component.email?.field?.subject && <Grid item xs={12} className={props.classes.field}>
              <TextField
                  form={props.form}
                  name="subject"
                 required={config.component.email.field.subject.required}
                  label={t("Subject")}
                />
              </Grid> }

            {config.component.email?.field?.message &&  <Grid item xs={12} className={props.classes.field}>
              <TextField
                  form={props.form}
                  name="message"
                  multiline
                  maxRows={config.component.email.field.message.disabled ? 4: 10}
                  disabled={!!config.component.email.field.message.disabled}
                  required={config.component.email.field.message.required}
                  label={t("Your message")}
                />
              </Grid> }
            {config.component.email?.field?.comment &&  <Grid item xs={12}>
              <TextField
                  form={props.form}
                  name="comment"
                  multiline
                  maxRows={3}
                  required={config.component.email.field.comment.required}
                  label={t("Comment")}
                />
              </Grid> }
      </>
    );
  };

  const onClick = config.component.email?.server !== true ? send : null;
  return (
      <Container maxWidth="sm">
      {config.component.email?.progress && (
        <ProgressCounter actionPage={props.actionPage} />
      )}
      {config.component.email?.filter?.includes("country") && (
        <Country form={form} list={config.component?.email?.countries} />
      )}
      {config.component.email?.showTo !== false && (
        <List>
          {profiles.map((d) => (
            <EmailAction
              key={d.id || JSON.stringify(d)}
              actionPage={config.actionPage}
              done={props.done}
              actionUrl={props.actionUrl || data.actionUrl}
              actionText={t(["campaign:share.twitter", "campaign:share"])}
              {...d}
            ></EmailAction>
          ))}
        </List>
      )}
      <Register form={form} done={props.done} targets={profiles} onClick={onClick} extraFields={ExtraFields}/>
    </Container>
  );
};

export default Component;
