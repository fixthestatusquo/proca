import React from "react";
import { Controller } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  Box,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import TextField from "@components/field/TextField";
import MultiSelectCheckbox from "@components/field/MultiSelect";

const GenerateQuestions = ({ json, form, findQuestionById, dep=false }) => {
  if (json.type === "FreeTextQuestion") {
    return <TextQuestion form={form} json={json} />;
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
      <Typography key={json.id} variant="h6" sx={{ mt: 4, mb: 2 }}>
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
    console.log("Upload question type is not implemented");
    // Returning null because there are dependant uploads
    return null;
  }

  return "Unknown question type";
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

const getDependantIds = (options, selected) => {
  return options
    .filter(opt => selected.includes(String(opt.id)))
    .flatMap(opt =>
      (opt.dependentElementsString?.split(";") || []).filter(Boolean)
    )
    .map(Number);
};

const TextQuestion = ({ json, form, dep }) => {
  const multiline = json.strippedTitle.length > 30 && json.maxCharacters > 100;
  return (
    <>
      {!dep && (
        <FormLabel component="legend" style={{ marginTop: 16 }}>
          {json.strippedTitle}
        </FormLabel>
      )}
      <TextField
        form={form}
        label={dep ? json.strippedTitle : ""}
        name={json.attributeName}
        multiline={multiline}
        minRows={multiline ? 3 : 1}
        inputProps={{
          maxLength: json.maxCharacters || 100,
        }}
        helperText={`${(form.watch(json.attributeName) || "").length}/${json.maxCharacters || 100} characters`}
      />
    </>
  );
};

const SingleChoiceInput = ({ json, form, findQuestionById }) => {
  const selected = form.watch(json.attributeName) || "";
  const dependentIds = getDependantIds(json.possibleAnswers, [selected]);

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
          dep={true}
        />
      )}
    </FormControl>
  );
};

const MultipleChoiceInput = ({ json, form, findQuestionById }) => {
  const maxChoices = json.maxChoices ?? null;
  const selected = form.watch(json.attributeName) || [];

  const dependentIds = getDependantIds(json.possibleAnswers, selected);

  // Build options map { id: label }
  const options = json.possibleAnswers.reduce((acc, opt) => {
    acc[String(opt.id)] = opt.text;
    return acc;
  }, {});

  return (
    <FormControl component="fieldset" fullWidth margin="normal">
      <FormLabel component="legend">{json.strippedTitle}</FormLabel>

      <MultiSelectCheckbox
        form={form}
        name={json.attributeName}
        label={null} // or pass a sublabel if needed
        options={options}
        maxChoices={maxChoices}
      />

      {/* Render dependent questions if any are selected */}
      {dependentIds.length > 0 && (
        <DependentQuestions
          ids={dependentIds}
          findQuestionById={findQuestionById}
          form={form}
          dep={true}
        />
      )}
    </FormControl>
  );
};

const Survey = ({ form, ids: questionIds, questions }) => {
  const findQuestionById = id => questions?.find(q => q.id === id);
  if (!questions) return null;
  return (
    <>
      {questionIds.map(q => {
        // Assuming each question has a `json` field with the data
        const json = questions.find(item => item.id === q);
        return (
          <GenerateQuestions
            json={json}
            form={form}
            key={json.id}
            findQuestionById={findQuestionById}
          />
        );
      })}
    </>
  );
};

export default Survey;
