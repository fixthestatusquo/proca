import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { InputAdornment } from "@material-ui/core";
import Salutation from "@components/field/Gender";
import { FormLabel, Grid, Button, CircularProgress } from "@material-ui/core";
import TextField from "@components/field/TextField";

const Comment = ({ form, classField, enforceRequired, name, label }) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();
  const loaders = config.component.loader;
  const lang = config.locale;
  const [state, setState] = useState('untouched'); //untouched->loading->loaded
  const isLoading = state === 'loading';
  const { t } = useTranslation();

  if (!name) name="comment";
  if (!label) label=t(name);


useEffect(() => {
  return () => {
    console.log("unload");
    // Cancel any ongoing fetch if component unmounts
    // You might need an AbortController for this
  };
}, []);

  const fetchData = async () => {
/*  isValid = form.getValues("firstname");
  if (!isValid) {
    const isValid  = await form.trigger("firstname", { shouldFocus: true}); //display the error
//    console.log("Field is invalid");
    return;
  }
*/
    setState('loading');
    const formData = form.getValues();
    const data = {firstname:formData.firstname, country: formData.country, locality: formData.locality, question: label, id: name};

    try {
        let url =
          loaders.url || "https://" + config.campaign.name + ".proca.app/";
        if (loaders.url === false) return null;
        if (loaders.appendLocale === true) url += lang;

        let d = null;
        let json = null;
          d = await fetch(url).catch(e => {
console.log(e);
          });
          json = await d.json();
            form.setValue(name, json.message);

      setState('loaded');
    } catch (error) {
      console.error("Fetch error:", error);
      form.setValue(name, "Failed to load the message");
      setState('error');
    }
  };

  const labelInside = label.length <= 30;
  return (
    <>
      <Grid item xs={12} className={classField}>
      {!labelInside && <FormLabel component="legend">{label}</FormLabel>}

        <TextField
          form={form}
          name={name}
          multiline
          label={labelInside && label}
          maxRows="10"
          helperText={state === 'loaded' &&  "We encourage you to read and customise it to maximise its impact"}
        />
      </Grid>
      <Grid item xs={12} className={classField}>
        {state !== 'loaded' &&<Button
          variant="contained"
          color="secondary"
          onClick={fetchData}
          disabled={isLoading}
        >
         {t("help_write", "Help me write it")}
        </Button>}
        {state === 'loaded' &&<Button
variant="outlined"
          onClick={fetchData}
        >
          {t("give_another", "Give me another")}
        </Button>}
      </Grid>
    </>
  );
};

export default Comment;
