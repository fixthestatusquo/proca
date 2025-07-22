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

import { imports } from "../actionPage";

  const DetailsStep = ({form, handleNext}) => {
  const classes = useStyles();
  const config = useCampaignConfig();
  const [data] = useData();
  const classField = data.uuid && isValid ? classes.hidden : classes.field;
  const enforceRequired = true;
    const compact = useCompactLayout("#proca-contact", 380);
    return (<>
      <Grid container spacing={1} id="proca-contact">
        <NameField
          form={form}
          compact={compact}
          classField={classField}
        />
        <Address form={form} compact={compact} classField={classField} />
        <CommentField form={form} classField={classField} compact={compact} />
      </Grid>
        <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
       </Box>
    </>);
  };

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
  const questionIds = config.component?.questions || [];

  const { questions, loading, error } = useConsultJson("14670-European-affordable-housing-plan",config.lang);



  // Navigate to a specific step when clicked
  const handleStepClick = step => {
    console.log("go to step ", step);
    if (step < 3) {
      setActiveStep(step);
    }
    if (step < activeStep) {
      // Allow going back, but restrict jumping ahead
      setActiveStep(step);
    }
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

  const SurveyStep = imports[config.component.consultation];
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

      {activeStep === 0 && <DetailsStep form={form} handleNext={handleNext} />}
      {activeStep === 1 && <SurveyStep form={form} handleNext={handleNext} questions = {questions} ids={questionIds}/>}

      {activeStep === 3 && (
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
