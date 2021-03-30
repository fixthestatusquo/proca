import React, { useState } from "react";
import { Stepper, Step, StepButton } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import EciIcon from "@material-ui/icons/HowToVote";
import ShareIcon from "@material-ui/icons/Share";

import Email from "./Email";
import Support from "./Support";
import Share from "../Share";
import Alert from "../Alert";
import { useCampaignConfig } from "../../hooks/useConfig";
import { useTranslation } from "./hooks/useEciTranslation";
import { useIsMobile } from "../../hooks/useLayout";
import SwipeableViews from "react-swipeable-views";

export default function StepperEci(props) {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const config = useCampaignConfig();

  const steps =
    config.component.eci.starts === "email"
      ? ["register", "eci", "share"]
      : ["eci", "register", "share"];

  const [value, setValue] = useState(steps[0]);
  const [crumbbread, setCrumbbread] = useState(null); // result of the last step
  const step = (s) => steps.indexOf(s);

  const doneEmail = (result) => {
    setCrumbbread(result);
    setValue(steps[step("register") + 1]);
  };

  const doneEci = () => {
    console.log("eci saved");
    setSubmitted(true);
    setValue(steps[step("eci") + 1]);
  };
  const handleStep = (s) => () => {
    setValue(s);
  };

  const iconColor = (s) => {
    return value === s ? "primary" : "disabled";
  };

  const StepsComponent = (step) => {
    switch (step) {
      case "eci":
        return <Support key={step} done={doneEci} {...crumbbread} />;
      case "register":
        return (
          <Email
            key={step}
            done={doneEmail}
            {...crumbbread}
            submitted={submitted}
          />
        );
      case "share":
        return <Share key={step} done={props.done} {...crumbbread} />;
      default:
        return <div>DEFAULT</div>;
    }
  };

  const Steps = (step) => {
    switch (step) {
      case "eci":
        return (
          <Step key="eci">
            <StepButton
              onClick={handleStep("eci")}
              icon={<EciIcon color={iconColor("eci")} />}
            >
              {t("Sign the ECI")}
            </StepButton>
          </Step>
        );
      case "register":
        return (
          <Step key="register">
            <StepButton onClick={handleStep("register")}>
              {t("Join")}
            </StepButton>
          </Step>
        );
      case "share":
        return (
          <Step key="share">
            <StepButton
              onClick={handleStep("share")}
              icon={<ShareIcon color={iconColor("share")} />}
            >
              {t("Share")}
            </StepButton>
          </Step>
        );
      default:
        return <div>DEFAULT</div>;
    }
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
        {steps.map((s) => Steps(s))}
      </Stepper>
      <Box p={1}>
        <SwipeableViews index={step(value)} slideStyle={{ overflow: "none" }}>
          {steps.map((s, i) => (
            <div style={{ display: step(value) === i ? "block" : "none" }}>
              {StepsComponent(s)}
            </div>
          ))}
        </SwipeableViews>
      </Box>
    </>
  );
}
