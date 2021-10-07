import React, { useCallback } from "react";

import {
  makeStyles,
  Step,
  StepIcon,
  StepLabel,
  Stepper,
} from "@material-ui/core";

import { atom, useRecoilState } from "recoil";
import { goStep, useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";

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

const iconStyles = makeStyles({ root: { fontSize: "2em" } });

const BiggerStepIcon = (props) => {
  const classes = iconStyles();
  return <StepIcon classes={{ root: classes.root }} {...props}></StepIcon>;
};

const labelStyles = makeStyles({
  root: {
    fontSize: "1em",
  },
  label: {
    fontSize: "1em",
    // "&$active": {      color: "orange",    },  },
  },
  // active: {},
});

const StyledStepLabel = (props) => {
  const classes = labelStyles();
  return (
    <StepLabel
      classes={{
        root: classes.root,
        label: classes.label,
        active: classes.active,
      }}
      StepIconComponent={BiggerStepIcon}
      {...props}
    ></StepLabel>
  );
};
const AmountLabel = ({ amount, symbol }) => {
  const { t } = useTranslation();
  return (
    <span style={{ fontSize: "1.1em" }}>
      {t("{{amount}} {{symbol}}", {
        amount: amount,
        symbol: symbol,
      })}
    </span>
  );
};

const stepperStyles = makeStyles({
  root: { paddingBottom: 0, paddingRight: "24px", paddingLeft: "24px" },
});

const Steps = (props) => {
  const { t } = useTranslation();
  const [donateStep, setDonateStep] = useDonateStep();
  const [formData] = useData();

  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const currency = donateConfig.currency;

  const classes = stepperStyles();

  return (
    <>
      <Stepper activeStep={donateStep} classes={{ root: classes.root }}>
        <Step
          key="amount"
          onClick={() => {
            setDonateStep(0);
            goStep("donate_Amount");
          }}
        >
          <StyledStepLabel>
            {donateStep === 1 ? (
              <AmountLabel amount={formData.amount} symbol={currency.symbol} />
            ) : (
              t("Amount")
            )}
          </StyledStepLabel>
        </Step>
        <Step key="payment">
          <StyledStepLabel>Payment</StyledStepLabel>
        </Step>
      </Stepper>
    </>
  );
};

export default Steps;
