import React, { useCallback } from "react";

import {
  Button,
  makeStyles,
  MobileStepper,
  Paper,
  Step,
  StepLabel,
  Stepper,
} from "@material-ui/core";

import { atom, useRecoilState } from "recoil";
import { goStep, useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: "1.25rem",
    "&$disabled": {
      color: theme.palette.action.disabled,
    },
  },
  lockIcon: {
    fontSize: theme.typography.fontSize,
  },
  arrowIcon: {
    // color: theme.palette.primary.contrastText,
    color: "inherit",
  },
  buttonRoot: {
    "&$disabled": {
      color: theme.palette.action.disabled,
    },
    color: theme.palette.primary.contrastText,
  },
}));

const donateStepAtom = atom({ key: "donateStep", default: 0 });

export const useDonateStep = () => {
  const [donateStep, _setDonateStep] = useRecoilState(donateStepAtom);
  const setDonateStep = useCallback(
    (step) => {
      _setDonateStep(step);
    },
    [_setDonateStep]
  );

  return [donateStep, setDonateStep];
};

const Steps = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [donateStep, setDonateStep] = useDonateStep();
  const [formData] = useData();

  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const currency = donateConfig.currency;

  return (
    <div>
      <Stepper activeStep={donateStep}>
        <Step
          key="amount"
          onClick={() => {
            setDonateStep(0);
            goStep("donate_Amount");
          }}
        >
          <StepLabel>
            {donateStep === 1
              ? t("Donate {{amount}} {{symbol}}", {
                  amount: formData.amount,
                  symbol: currency.symbol,
                })
              : t("Amount")}
          </StepLabel>
        </Step>
        <Step key="payment">
          Payment
          <StepLabel>Payment</StepLabel>
        </Step>
      </Stepper>
    </div>
  );
};

export default Steps;
