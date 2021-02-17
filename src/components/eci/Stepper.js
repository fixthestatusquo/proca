import React, { useState } from "react";
import { Stepper, Step, StepButton } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import EciIcon from "@material-ui/icons/HowToVote";
import ShareIcon from "@material-ui/icons/Share";

import Email from "./Email";
import Support from "./Support";
import Share from "../Share";
import Alert from "../Alert";
import { useTranslation } from "./hooks/useEciTranslation";
import { useIsMobile } from "../../hooks/useLayout";

export default function Target(props) {
  const [value, setValue] = useState("eci");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const step = (s) => ["eci", "register", "share"].indexOf(s);

  const doneEmail = () => {
    setValue("share");
  };

  const doneEci = () => {
    console.log("eci saved");
    setSubmitted(true);
    setValue("register");
  };
  const handleStep = (s) => () => {
    setValue(s);
  };

  const iconColor = (s) => {
    return value === s ? "primary" : "disabled";
  };

  return (
    <>
      {submitted && (
        <Alert severity="success">
          {t("eci:congratulations.successfully-title")}
        </Alert>
      )}
      <Stepper
        nonLinear
        alternativeLabel={useIsMobile()}
        activeStep={step(value)}
      >
        <Step key="eci">
          <StepButton
            onClick={handleStep("eci")}
            icon={<EciIcon color={iconColor("eci")} />}
          >
            {t("Sign the ECI")}
          </StepButton>
        </Step>
        <Step key="register">
          <StepButton onClick={handleStep("register")}>{t("Join")}</StepButton>
        </Step>
        <Step key="share">
          <StepButton
            onClick={handleStep("share")}
            icon={<ShareIcon color={iconColor("share")} />}
          >
            {t("Share")}
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
