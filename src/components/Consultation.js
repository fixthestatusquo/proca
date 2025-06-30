import React, { useState } from "react";
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
} from "@material-ui/core";
import { Collapse } from "@material-ui/core";

import NameField from "@components/field/Name";
import EmailField from "@components/field/Email";
import PhoneField from "@components/field/Phone";
import Address from "@components/field/Address";
import CommentField from "@components/field/Comment";

import { imports } from "../actionPage";

const Consultation = props => {
  const steps = ["survey", "contact", "preview"];
  const [activeStep, setActiveStep] = useState(0);

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

  //  const handleNext = () => setActiveStep((prev) => prev + 1);
  //  const handleBack = () => setActiveStep((prev) => prev - 1);

  const classes = useStyles();
  const config = useCampaignConfig();
  const [data] = useData();
  useSetActionType("consultation");
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
  const classField = data.uuid && isValid ? classes.hidden : classes.field;
  const enforceRequired = true;

  const SurveyStep = imports[config.component.consultation];

  const DetailsStep = () => {
    const compact = useCompactLayout("#proca-contact", 380);
    return (
      <Grid container spacing={1} id="proca-contact">
        <NameField
          form={form}
          compact={compact}
          classField={classField}
          enforceRequired={enforceRequired}
        />
        <EmailField
          form={form}
          required={enforceRequired}
          compact={compact}
          classField={classField}
        />
        <Address form={form} compact={compact} classField={classField} />
        <PhoneField form={form} classField={classField} compact={compact} />
        <CommentField form={form} classField={classField} compact={compact} />

//https://snowflaike.proca.app
      </Grid>
    );
  };
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

      {activeStep === 0 && <SurveyStep form={form} />}
      {activeStep === 1 && <DetailsStep />}

      {activeStep === 2 && (
        <Register
          form={form}
          buttonText="Prepare the letter"
          done={props.done}
          beforeSubmit={prepareData}
          onClick={onClick}
        />
      )}
    </>
  );
};

export default Consultation;
