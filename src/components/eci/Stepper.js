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
  const [value, setValue] = useState("register");

  const step = (s) => ["register", "eci", "share"].indexOf(s);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const doneEmail = () => {
    setValue("eci");
  };

  const doneEci = () => {
    setValue("share");
  };
  const handleStep = (s) => () => {
    setValue(s);
  };

  const iconColor = (s) => {
    return value === s ? "primary" : "disabled";
  };

  return (
    <>
      <Stepper nonLinear activeStep={step(value)}>
        <Step key="register">
          <StepButton onClick={handleStep("register")}>Join</StepButton>
        </Step>
        <Step key="eci">
          <StepButton
            onClick={handleStep("eci")}
            icon={<EciIcon color={iconColor("eci")} />}
          >
            Official Support
          </StepButton>
        </Step>
        <Step key="share">
          <StepButton
            onClick={handleStep("share")}
            icon={<ShareIcon color={iconColor("share")} />}
          >
            Share
          </StepButton>
        </Step>
      </Stepper>
      <Box p={1}>
        {value === "register" && <Email done={doneEmail} />}
        {value === "eci" && <Support done={doneEci} />}
        {value === "share" && <Share done={props.done} />}
      </Box>
    </>
  );
}
