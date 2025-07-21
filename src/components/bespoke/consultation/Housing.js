import React, { useState, useEffect } from "react";
import { useConfig,  useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import MultiSelect from "@components/field/MultiSelect";
import SingleSelect from "@components/field/Select";
import { FormControl, FormLabel, Box, Button, Typography } from "@material-ui/core";
import TextField from "@components/TextField";

const c=[{  }]

const Survey = ({ form, handleNext }) => {
  const { i18n } = useTranslation();
  const config = useConfig();
  const questions = useCampaignConfig().component?.questions || [];
  const consultLang = i18n.language;
  const generateQuestions = (json) => {
    if (json.type === "FreeTextQuestion") {
      return (
        <FormControl component="fieldset" key={json.id} fullWidth margin="normal">
          <FormLabel component="legend">{json.strippedTitle}</FormLabel>
          <TextField
            form={form}
            id={json.id}
            name={json.attributeName}
            multiline
            minRows={3}
            inputProps={{
              maxLength: json.max_length || 300,
            }}
            helperText={`${(form.watch(json.attributeName) || "").length}/${json.max_length || 300} characters`}
          />
        </FormControl>
      );

    }

    if (json.type === "SingleChoiceQuestion") {
      return (<div key={json.id}>SingleChoiceQuestion</div>);
    }
    if (json.type === "MultipleChoiceQuestion") {
      return <div key={json.id}>MultipleChoiceQuestion: {json.title}</div>;
    }
    if (json.type === "Section") {
      return (
        <Typography
          key={json.id}
          variant="h6"
          sx={{ mt: 4, mb: 2 }}
        >
          {json.strippedTitle || json.title}
        </Typography>
      );
    }

    if (json.type === "Text") {
      return (
        <Typography key={json.id} variant="body1" sx={{ my: 2 }}>
          {json.strippedTitle}
        </Typography>
      );
    }


    if (json.type === "Upload") {
      return <div key={json.id}>Upload: {json.title}</div>;
    }
    // Add more logic depending on your json structure
    return 'Unknown question type';
  };
  return (
    <>
      {
        questions.map(q => {
          // Assuming each question has a `json` field with the data
          const json = c.find(item => item.id === q);
          console.log("json", json);
          const question = generateQuestions(json);
          return question;
        })
      }
    </>
  );
};

export default Survey;
