import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { InputAdornment } from "@material-ui/core";
import Salutation from "@components/field/Gender";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import TextField from "@components/TextField";

const Comment = ({ form, classField, enforceRequired }) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

useEffect(() => {
  console.log("display");
  return () => {
    console.log("unload");
    // Cancel any ongoing fetch if component unmounts
    // You might need an AbortController for this
  };
}, []);

  const fetchData = async () => {
    setIsLoading(true);
  isValid = form.getValues("firstname");
  if (!isValid) {
    const isValid  = await form.trigger("firstname", { shouldFocus: true}); //display the error 
//    console.log("Field is invalid");
    return;
  }    
    const formData = form.getValues();
    delete formData.last_name;
    delete formData.email;
    delete formData.phone_number;
    delete formData.postal_code;
    delete formData.comment;
    formData.stream = true;
    console.log("writing...");
    try {
      const response = await fetch(
        "https://snowflaike.proca.app/" + config.campaign.name,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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
            form.setValue("comment", aggregatedResponse);
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }

      //    const data = await response.json(); // Parse JSON response
      //console.log(data);
      //    form.setValue("comment", data.response);
    } catch (error) {
      console.error("Fetch error:", error);
      form.setValue("comment", "Failed to load the message");
    } finally {
      setIsLoading(false); // Stop loading (runs even if error occurs)
    }
  };

console.log("loading...",isLoading);
  return (
    <>
      <Grid item xs={12} className={classField}>
        <TextField
          form={form}
          name="comment"
          multiline
          maxRows="10"
          required={
            enforceRequired &&
            config.component.register?.field?.comment?.required
          }
          label={t("Comment")}
          helperText={t("help.comment", "")}
        />
      </Grid>
      <Grid item xs={12} className={classField}>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchData}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          Help me write the message
        </Button>
      </Grid>
    </>
  );
};

export default Comment;
