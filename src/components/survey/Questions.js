import React, {useEffect } from "react";
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
import SnowflakeTextField from "@components/field/SnowflakeTextField";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  elementMarginTop: (props) => ({
    marginTop: props.margin || theme.spacing(3),
    "& textarea": {
      minHeight: "auto!important",
    },
  }),
  section: (props) => ({
    marginTop: props.margin || theme.spacing(3),
    marginBottom: theme.spacing(-2),
  }),
}));


const Questions = ({ json, form, findQuestionById }) => {
  const classes = useStyles({margin: +json.margin});

  switch (json.type) {
    case "FreeTextQuestion":
      return <TextQuestion form={form} json={json}  />;
    case "SnowflakeAssistedQuestion":
      return <SnowflakeTextField form={form}

        label={json.title}
        name={json.attributeName}
        inputProps={{
          maxLength: json.maxCharacters,
        }}
        helperText={`${(form.watch(json.attributeName) || "").length}/${json.maxCharacters || 100} characters`}
        required={json.required || false}

 />;
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
  if (!Array.isArray(ids) || ids.length === 0) return null;

  return (
    <Box mt={-2} ml={1}>
      {ids.map((depId) => {
        const dep = findQuestionById(depId);
        return dep ? (
          <Questions
            key={dep.id}
            json={dep}
            form={form}
            findQuestionById={findQuestionById}
          />
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
  const classes = useStyles({margin: +json.margin});
  return (
    <Box className={classes.elementMarginTop}>
      <AITextField
        form={form}
        label={json.title}
        name={json.attributeName}
        maxLength={json.maxCharacters}
        required={json.required || false}
      />
    </Box>
  );
};


const TextQuestion = ({ json, form }) => {
  const classes = useStyles({margin: +json.margin});
  const multiline = json.title.length > 30 && json.maxCharacters > 100;
  const labelInside = json.title.length <= 30;
  return (
    <Box className={classes.elementMarginTop}>
      {!labelInside && <FormLabel component="legend">{json.title}</FormLabel>}
      <TextField
        form={form}
        required={json.required || false}
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
  return (
      <SingleSelect
        id={json.id}
        form={form}
        name={json.attributeName}
        options={options}
        label={json.title}
        row={row}
        required={json.required || false}
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
      required={json.required || false}
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
  const { t } = useTranslation();
  const findQuestionById = (id) =>
    questions?.find((q) => String(q.id) === String(id));

 // const [showRequiredNotice, setShowRequiredNotice] = useState(false);

  const handleContinue = async () => {
    const valid = await form.trigger();
    if (!valid) {
     // setShowRequiredNotice(true);
      return;
    }

    // setShowRequiredNotice(false);
   handleNext?.() ?? true;
  };

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
            key={json.id || json.attributeName}
            findQuestionById={findQuestionById}
          />
        );
      })}
      {/* {showRequiredNotice && (
        <p>fill in all required</p>
      )} */}
      {handleNext && (
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleContinue}
          >
           {t("Next", "Next")}
          </Button>
        </Box>)
      }
    </>
  );
};

export default Survey;
