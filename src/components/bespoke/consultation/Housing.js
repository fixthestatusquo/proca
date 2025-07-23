import React, { useEffect, useState } from "react";
import useData from "@hooks/useData";
import Register, { useStyles } from "@components/Register";
import { useCompactLayout } from "@hooks/useElementWidth";
import { useTranslation } from "react-i18next";
import {
  useCampaignConfig,
  useSetCampaignConfig,
  useSetActionType,
} from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import {
  Grid,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Paper,
  Button,
  Box,
} from "@material-ui/core";
import { Collapse } from "@material-ui/core";

import NameField from "@components/field/Name";
import Address from "@components/field/Address";
import CommentField from "@components/field/Comment";

import SurveyStep from "@components/survey/Questions";
import DetailsStep from "@components/survey/YouStep";


const TestAIStep = ({form, handleNext}) => {
  const classes = useStyles();
  const [data] = useData();
  const classField = data.uuid && isValid ? classes.hidden : classes.field;
console.log("test AI");
        return <CommentField form={form} classField={classField} />
}

const useConsultJson = (name,lang) => {


  const [questions, setQuestions] = useState(undefined);
  const [loading, setLoading] = useState(!!name);
  const [error, setError] = useState(null);

 useEffect(() => {
  const url =`https://static.proca.app/survey/${name}/consult_${lang}.json`
  const fetchData = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!name) return undefined;
  fetchData();
}, [name,lang]);

  return {
    questions,
    loading,
    error
  };
};


const Consultation = props => {
  const steps = ["you","expert", "citizen","test AI", "send"];
  const [activeStep, setActiveStep] = useState(0);
  const classes = useStyles();
  const [data] = useData();
  useSetActionType("consultation");
  const config = useCampaignConfig();
  const qids = config.component.consultation.steps || {};

  const { questions, loading, error } = useConsultJson(config.component.consultation.name,config.lang);


  // Navigate to a specific step when clicked
  const handleStepClick = step => {
    console.log("go to step ", step);
    setActiveStep(step);
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  //  const handleBack = () => setActiveStep((prev) => prev - 1);

  const form = useForm({
    //mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: Object.assign({}, data, {
      language: config.locale,
    }),
  });

  const prepareData = (data) => {
    console.log("prepareData",data);
    return data;
  };
  const onClick = () => {
    console.log("onClick");
  };

  const isValid = Object.keys(form.formState.errors).length === 0;

  //if (loading) return <LinearProgress/>;
  if (error) return <p>Error loading consult: {error.message}</p>;

  return (
    <>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        style={{ width: "100%", backgroundColor: "transparent"  }}
        nonLinear
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepButton onClick={() => handleStepClick(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && <DetailsStep form={form} handleNext={handleNext} questions = {questions} SurveyStep = {SurveyStep} />}
      {activeStep === 1 && <SurveyStep form={form} handleNext={handleNext} questions = {questions} ids={qids[steps[1]].questions}/>}
      {activeStep === 2 && <SurveyStep form={form} handleNext={handleNext} questions = {questions} ids={qids[steps[2]].questions}/>}
      {activeStep === 3 && <TestAIStep form={form} handleNext={handleNext} />}

      {activeStep === 4 && (
        <Register
          form={form}
          buttonText="Send"
          done={props.done}
          beforeSubmit={prepareData}
          onClick={onClick}
        />
      )}
    </>
  );
};

export default Consultation;
