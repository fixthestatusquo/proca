import React from "react";
import {
  Box,
  Button,
  FormLabel,
  Typography,
  makeStyles,
} from "@material-ui/core";
import TextField from "@components/field/TextField";
import MultiSelectCheckbox from "@components/field/MultiSelect";
import SingleSelect from "@components/field/SingleSelect";
import AITextField from "@components/field/AITextField";

const useStyles = makeStyles((theme) => ({
  elementMarginTop: {
    marginTop: theme.spacing(3),
   "& textarea": {
     minHeight: "auto!important",
   }
  },
  section: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(-2),
  },
}));

const Questions = ({ json, form, findQuestionById }) => {
  const classes = useStyles();

  switch (json.type) {
    case "FreeTextQuestion":
      return <TextQuestion form={form} json={json}  />;
    case "AIAssistedQuestion":
      return <AITextQuestion form={form} json={json} />;

    case "SingleChoiceQuestion":
      return (
        <Box className={classes.elementMarginTop} id={json.id}>
          <SingleChoiceInput
            key={json.id}
            json={json}
            form={form}
            findQuestionById={findQuestionById}
          />
        </Box>
      );

    case "MultipleChoiceQuestion":
      return (
        <Box className={classes.elementMarginTop} id={json.id}>
          <MultipleChoiceInput
            key={json.id}
            json={json}
            form={form}
            findQuestionById={findQuestionById}
          />
        </Box>
      );

    case "Section":
      return (
        <Typography
          key={json.id}
          id={json.id}
          variant="h6"
          className={classes.section}
        >
          {json.title}
        </Typography>
      );
    case "Text":
      return (
        <Typography
          key={json.id} id={json.id}
          variant="body1"
          className={classes.elementMarginTop}
        >
          {json.title}
        </Typography>
      );

    case "Upload":
      console.log("Upload question type is not implemented");
      // Returning null because there are dependant uploads
      return null;
    default:
      return <li>Unknown question type {json.type}</li>;
  }
};

const DependentQuestions = ({ ids, findQuestionById, form }) => {
  return (
    <Box mt={-2} ml={1}>
      {ids.map((depId) => {
        const dep = findQuestionById(depId);
        return dep ? (
            <Questions key={dep.id} json={dep} form={form} />
        ) : null;
      })}
    </Box>
  );
};

const getDependantIds = (options, selected) => {
  return options
    .filter((opt) => selected.includes(String(opt.id)))
    .flatMap((opt) =>
      (opt.dependentElementsString?.split(";") || []).filter(Boolean),
    )
    .map(Number);
};


const AITextQuestion = ({ json, form }) => {
  const classes = useStyles();
  return (
    <Box className={classes.elementMarginTop}>
      <AITextField
        form={form}
        label={json.title}
        name={json.attributeName}
        inputProps={{
          maxLength: json.maxCharacters,
        }}
        helperText={`${(form.watch(json.attributeName) || "").length}/${json.maxCharacters || 100} characters`}
      />
    </Box>
  );
};


const TextQuestion = ({ json, form }) => {
  const classes = useStyles();
  const multiline = json.title.length > 30 && json.maxCharacters > 100;
  const labelInside = json.title.length <= 30;
  return (
    <Box className={classes.elementMarginTop}>
      {!labelInside && <FormLabel component="legend">{json.title}</FormLabel>}
      <TextField
        form={form}
        label={labelInside ? json.title : ""}
        name={json.attributeName}
        multiline={multiline}
        minRows={multiline ? 3 : 1}
        inputProps={{
          maxLength: json.maxCharacters || 100,
        }}
        helperText={!labelInside && `${(form.watch(json.attributeName) || "").length}/${json.maxCharacters || 100} characters`}
      />
    </Box>
  );
};

const SingleChoiceInput = ({ json, form, findQuestionById }) => {
  const selected = form.watch(json.attributeName) || "";
  const dependentIds = getDependantIds(json.possibleAnswers, [selected]);

  const options = json.possibleAnswers.map((opt) => ({
    id: opt.id,
    text: opt.text,
  }));

  const row = (Object.keys(options).length <=2 ? true : undefined); // two options, like yes/no
   console.log (json.attributeName, row);
  return (
      <SingleSelect
        id={json.id}
        form={form}
        name={json.attributeName}
        options={options}
        label={json.title}
        row={row}
      >

      {dependentIds.length > 0 && (
        <DependentQuestions
          ids={dependentIds}
          findQuestionById={findQuestionById}
          form={form}
        />
      )}
    </SingleSelect>
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
      <MultiSelectCheckbox
        id={json.id}
        form={form}
        name={json.attributeName}
        label={json.title}
        options={options}
        maxChoices={maxChoices}
      >

      {/* Render dependent questions if any are selected */}
      {dependentIds.length > 0 && (
        <DependentQuestions
          ids={dependentIds}
          findQuestionById={findQuestionById}
          form={form}
        />
      )}
      </MultiSelectCheckbox>
  );
};

const Survey = ({ form, handleNext, ids: questionIds, questions }) => {
  const findQuestionById = (id) => questions?.find((q) => q.id === id);
  if (!questions) return null;
  return (
    <>
      {questionIds.map((q) => {
        // Assuming each question has a `json` field with the data
        const json = questions.find((item) => item.id === q);
        return (
          <Questions
            json={json}
            form={form}
            key={json.id}
            findQuestionById={findQuestionById}
          />
        );
      })}
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </>
  );
};

export default Survey;
