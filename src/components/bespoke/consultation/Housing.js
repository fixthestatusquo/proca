import React, { useState, useEffect } from "react";
import { useConfig,  useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import MultiSelect from "@components/field/MultiSelect";
import SingleSelect from "@components/field/Select";
import { Controller } from "react-hook-form";
import { FormControl, FormLabel, FormControlLabel, Box, Button, Radio, RadioGroup, Typography } from "@material-ui/core";
import TextField from "@components/TextField";

const c = [{}]

const TextInput = ({ json, form }) => {
  return (
    <FormControl component="fieldset" fullWidth margin="normal">
      <FormLabel component="legend">{json.strippedTitle}</FormLabel>
      <TextField
        form={form}
        name={json.attributeName}
        multiline
        minRows={3}
        inputProps={{
          maxLength: json.max_length || 300,
        }}
        helperText={`${(form.watch(json.attributeName) || "").length}/${json.max_length || 300} characters`}
      />
    </FormControl>
  )
};




const Survey = ({ form, handleNext }) => {
  const { i18n } = useTranslation();
  const config = useConfig();
  const questions = useCampaignConfig().component?.questions || [];
  const consultLang = i18n.language;

  const generateQuestions = (json) => {
    if (json.type === "FreeTextQuestion") {
      return (<TextInput json={json} key={json.id} form={form} />);
    }

    if (json.type === "SingleChoiceQuestion") {
      return (
        <SingleChoiceInput
          key={json.id}
          json={json}
          form={form}
          findQuestionById={(id) => c.find(q => q.id === id)}
        />
      );
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


const SingleChoiceInput = ({ json, form, findQuestionById }) => {
  const selected = form.watch(json.attributeName);
  const selectedOption = json.possibleAnswers.find(opt => String(opt.id) === String(selected));
  const dependentIds = selectedOption?.dependentElementsString?.split(";").filter(Boolean) || [];

  return (
    <FormControl component="fieldset" fullWidth margin="normal">
      <FormLabel component="legend">{json.strippedTitle}</FormLabel>
      <Controller
        control={form.control}
        name={json.attributeName}
        defaultValue=""
        render={({ field }) => (
          <RadioGroup {...field}>
            {json.possibleAnswers.map(opt => (
              <FormControlLabel
                key={opt.id}
                value={String(opt.id)}
                control={<Radio />}
                label={opt.text}
              />
            ))}
          </RadioGroup>
        )}
      />

      {/* Render dependent elements if any */}
      {dependentIds.map(depId => {
        const dep = findQuestionById(Number(depId));
        return dep ? (
          <Box key={dep.id} sx={{ mt: 2, ml: 3 }}>
            {generateQuestions(dep)} {/* Reuse the generator */}
          </Box>
        ) : null;
      })}
    </FormControl>
  );
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
