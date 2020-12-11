import React, { useState } from "react";
import { Stepper, Step, StepButton } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";

import EmailIcon from "@material-ui/icons/FavoriteBorder";
import EciIcon from "@material-ui/icons/HowToVote";
import ShareIcon from "@material-ui/icons/Share";

import Email from "./Email";
import Support from "./Support";
import Share from "../Share";

export default function Target(props) {
  const [value, setValue] = useState("email");

  const [activeStep, setStep] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const doneEmail = () => {
    setStep(1);
    setValue("eci");
  };

  const doneEci = () => {
    setStep(2);
    setValue("share");
  };
  const handleStep = (step) => () => {
    setStep(step);
  };

  const iconColor = (step) => {
    return step === activeStep ? "primary" : "disabled";
  };

  return (
    <>
      <Stepper nonLinear activeStep={activeStep}>
        <Step key="register">
          <StepButton onClick={handleStep(0)}>Join</StepButton>
        </Step>
        <Step key="eci">
          <StepButton
            onClick={handleStep(1)}
            icon={<EciIcon color={iconColor(1)} />}
          >
            Official Support
          </StepButton>
        </Step>
        <Step key="share">
          <StepButton
            onClick={handleStep(2)}
            icon={<ShareIcon color={iconColor(2)} />}
          >
            Share
          </StepButton>
        </Step>
      </Stepper>
      <Box p={1}>
        {activeStep === 0 && <Email done={doneEmail} />}
        {activeStep === 1 && <Support done={doneEci} />}
        {activeStep === 2 && <Share done={props.done} />}
      </Box>
    </>
  );
}
