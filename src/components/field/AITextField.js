import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { InputAdornment } from "@material-ui/core";
import Salutation from "@components/field/Gender";
import { FormLabel, Grid, Button, CircularProgress } from "@material-ui/core";
import TextField from "@components/field/TextField";
import AIIcon from "../../images/AI";
import SvgIcon from "@material-ui/core/SvgIcon";

const Comment = ({ form, classField, enforceRequired, name, label }) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();
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
    const data = {firstname:formData.firstname, country: formData.country, locality: formData.locality, question: label, id: name, stream: true};
    if (formData[name].length < 100) {
      data[name] = formData[name];
    } else {
      data[name] = '';
    }
    console.log("writing...");
    
    console.log (data);
     
    try {
      const response = await fetch(
        "https://snowflaike.proca.app/" + config.campaign.name,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let aggregatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process each complete line
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const jsonStr = line.substring(6); // Remove 'data: ' prefix
            if (jsonStr.trim() === "[DONE]") continue;

            const data = JSON.parse(jsonStr);
            aggregatedResponse += data.response || "";
            form.setValue(name, aggregatedResponse);
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }

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
          helperText={state === 'loaded' &&  "An AI wrote this message, we encourage you to read and customise it to maximise its impact"}
        />
      </Grid>
      <Grid item xs={12} className={classField}>
        {state !== 'loaded' &&<Button
          variant="contained"
          color="secondary"
          onClick={fetchData}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SvgIcon size={20}><AIIcon /></SvgIcon> }
        >
          {isLoading ? "AI at work" : "Help me write it"}
        </Button>}
        {state === 'loaded' &&<Button
variant="outlined"
          onClick={fetchData}
          startIcon={<SvgIcon size={20}><AIIcon /></SvgIcon> }
        >
          Generate another
        </Button>}
      </Grid>
    </>
  );
};

export default Comment;
