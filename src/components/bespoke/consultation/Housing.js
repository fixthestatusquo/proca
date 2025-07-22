import React, { useState, useEffect } from "react";
import { useConfig,  useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { Checkbox, FormControl, FormGroup, FormLabel, FormControlLabel, Box, Radio, RadioGroup, Typography, LinearProgress } from "@material-ui/core";
import TextField from "@components/field/TextField";
import MultiSelectCheckbox from "../../field/MultiSelect";


const GenerateQuestions = ({json, form, findQuestionById}) => {
    if (json.type === "FreeTextQuestion") {
      return (<TextInput json={json} key={json.id} form={form} />);
    }

    if (json.type === "SingleChoiceQuestion") {
      return (
        <SingleChoiceInput
          key={json.id}
          json={json}
          form={form}
          findQuestionById={findQuestionById}
        />
      );
    }

    if (json.type === "MultipleChoiceQuestion") {
       return (
      <MultipleChoiceInput
        key={json.id}
        json={json}
        form={form}
        findQuestionById={findQuestionById}
      />
    );
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
      return <div key={json.id}>No upload! {json.strippedTitle}</div>;
    }
    // Add more logic depending on your json structure
    return 'Unknown question type';
  };

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

const DependentQuestions = ({ ids, findQuestionById, form }) => {
  return (
    <>
      {ids.map(depId => {
        const dep = findQuestionById(depId);
        return dep ? (
          <Box key={dep.id} sx={{ mt: 2, ml: 3 }}>
            <GenerateQuestions json={dep} form={form} />
          </Box>
        ) : null;
      })}
    </>
  );
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
    {dependentIds.length > 0 && (
      <DependentQuestions
        ids={dependentIds}
        findQuestionById={findQuestionById}
        form={form}
      />
    )}
    </FormControl>
  );
};

const MultipleChoiceInput = ({ json, form, findQuestionById }) => {
  const maxChoices = json.maxChoices ?? null;
  const selectedValues = form.watch(json.attributeName) || [];

  const dependentIds = json.possibleAnswers
    .filter(opt => selectedValues.includes(String(opt.id)))
    .flatMap(opt =>
      (opt.dependentElementsString?.split(";") || []).filter(Boolean)
    )
    .map(Number);

  // Build options map { id: label }
  const options = json.possibleAnswers.reduce((acc, opt) => {
    acc[String(opt.id)] = opt.text;
    return acc;
  }, {});

  return (
    <FormControl component="fieldset" fullWidth margin="normal">

      <MultiSelectCheckbox
        form={form}
        name={json.attributeName}
        label={json.strippedTitle}
        options={options}
        maxChoices={maxChoices}
      />

      {/* Render dependent questions if any are selected */}
      {dependentIds.length > 0 && (
        <DependentQuestions
          ids={dependentIds}
          findQuestionById={findQuestionById}
          form={form}
        />
      )}
    </FormControl>
  );
};


const Survey = ({ form, handleNext, ids: questionIds, questions }) => {
  const { i18n } = useTranslation();
  const config = useConfig();

   const findQuestionById = (id) => questions?.find(q => q.id === id);

   console.log("questions", questions,questionIds);
   if (!questions) return null;

 return (
    <>
      {
        questionIds.map(q => {
          // Assuming each question has a `json` field with the data
          const json = questions.find(item => item.id === q);
          if (!json) return "NO data for question " + q;
          return <GenerateQuestions json={json} form={form} key={json.id} findQuestionById={findQuestionById} />
        })
      }
    </>
  );
};

export default Survey;
