import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { FormLabel, Grid, Button, CircularProgress } from "@material-ui/core";
import TextField from "@components/field/TextField";
import AIIcon from "../../images/AI";
import SvgIcon from "@material-ui/core/SvgIcon";
import { useTheme } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import dispatch from "@lib/event";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  alertStack: {
    position: "relative",
    paddingBottom: 40, // Adds space at the bottom so the button doesn't overlap text

    "& .proca-MuiAlert-action": {
      position: "absolute",
      bottom: 8,
      right: 16, // Aligns to the bottom right
      padding: 0,
      margin: 0,
    },
  },
});

const AINotice = ({ state, regenerate }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    state === "loaded" && (
      <Alert
        severity="warning"
        classes={{ root: classes.alertStack }}
        action={
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={regenerate}
            startIcon={
              <SvgIcon size={20}>
                <AIIcon />
              </SvgIcon>
            }
          >
            {t("give_another", "Generate another")}
          </Button>
        }
      >
        {t("ai_check")}
      </Alert>
    )
  );
};
const Comment = ({
  form,
  classField,
  required,
  name,
  label,
  maxLength,
  fields,
  recipient,
  help,
}) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();
  const theme = useTheme();
  const fetchPrompted = config.component.message?.prompted || false;
  const [state, setState] = useState("untouched"); //untouched->loading->loaded
  const isLoading = state === "loading";
  const { t } = useTranslation();

  if (!name) name = "comment";
  if (!label) label = t(name);
  const regenerate = async () => {
    form.setValue("comment", "");
    return await fetchData();
  };
  const fetchData = async () => {
    setState("loading");
    const formData = form.getValues();
    const data = {
      firstname: formData.firstname,
      lang: config.lang,
      country: formData.country,
      locality: formData.locality,
      question: fetchPrompted ? label : name,
      recipient: recipient,
      id: name,
      stream: true,
    };
    if (fields) {
      fields.forEach(d => {
        data[d] = formData[d];
      });
    }
    if (formData[name].length < 200) {
      data[name] = formData[name];
    } else {
      data[name] = "";
    }
    dispatch("snowflaike", { prompt: data[name].length });
    try {
      const response = await fetch(
        //"https://snowflaike.proca.app/" + config.campaign.name,
        //"http://localhost:8787"
        "https://snowflaike.proca.app" +
          (fetchPrompted ? "/" : "/~/") +
          config.campaign.name,
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

      if (response.headers.get("Content-Type") === "application/json") {
        // not a stream
        const data = await response.json();
        const d = data.response;
        form.setValue(name, d);
        if (d.length > maxLength) {
          console.log(d.length + "/" + maxLength);
          form.setError(name, {
            type: "length",
            message: d.length + "/" + maxLength,
          });
        }
        setState("loaded");
        return;
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
            const content = data.choices?.[0]?.delta?.content || "";
            if (content) {
              aggregatedResponse += content || "";
            } else {
              aggregatedResponse += data.response || "";
            }
            form.setValue(name, aggregatedResponse);
            if (aggregatedResponse.length > maxLength) {
              console.log(aggregatedResponse.length + "/" + maxLength);
              form.setError(name, {
                type: "length",
                message: aggregatedResponse.length + "/" + maxLength,
              });
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }

      setState("loaded");
    } catch (error) {
      console.error("Fetch error:", error);
      form.setValue(name, "Failed to load the message");
      setState("error");
    }
  };

  const text = form.watch(name) || "";
  const labelInside = label.length <= 30;

  const fieldError = form.formState.errors[name];

  return (
    <>
      <Grid item xs={12} className={classField}>
        {state !== "loaded" && !isLoading && (
          <Alert severity="info">
            {t("ai_tip", {
              button: t("help_write"),
            })}
          </Alert>
        )}
        {!labelInside && (
          <FormLabel
            component="legend"
            required={required}
            style={{ color: fieldError ? theme.palette.error.main : undefined }}
          >
            {label}
          </FormLabel>
        )}

        <TextField
          form={form}
          name={name}
          multiline
          required={required}
          label={labelInside ? label : ""}
          maxRows="10"
          onKeyDown={() => setState("modified")}
          maxLength={maxLength}
          error={!!fieldError || text?.length > maxLength}
          helperText={
            fieldError?.message ||
            (text?.length > maxLength ? `${text.length}/${maxLength}` : help)
          }
        />
      </Grid>
      <Grid item xs={12} className={classField}>
        {state !== "loaded" && (
          <Button
            variant="contained"
            color="secondary"
            onClick={fetchData}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <SvgIcon size={20}>
                  <AIIcon />
                </SvgIcon>
              )
            }
          >
            {isLoading
              ? t("ai_work", "AI at work")
              : t("help_write", "Help me write it")}
          </Button>
        )}
        <AINotice state={state} regenerate={regenerate} />
      </Grid>
    </>
  );
};

export default Comment;
