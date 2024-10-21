import React, { useCallback } from "react";

import {
  Box,
  makeStyles,
  Step,
  StepIcon,
  StepLabel,
  Stepper,
} from "@material-ui/core";

import { create } from "zustand";
import { goStep, useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData.js";
import { useTranslation } from "react-i18next";
import { useIsVeryNarrow } from "@hooks/useLayout";
import { useFormatMoney } from "@hooks/useFormatting.js";

export const useDonateStep = create((set) => ({
  donateStep: 0, // Initialize with a default value (change as needed)
  setDonateStep: (step) => set({ donateStep: step }),
}));

const iconStyles = makeStyles({ root: { fontSize: "2em" } });

const BiggerStepIcon = props => {
  const classes = iconStyles();
  return <StepIcon classes={{ root: classes.root }} {...props} />;
};

const labelStyles = makeStyles({
  root: {
    fontSize: "1.25em",
  },
  label: {
    fontSize: "1em",
    // "&$active": {      color: "orange",    },  },
  },
  // active: {},
});

const StyledStepLabel = props => {
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
    />
  );
};

const stepperStyles = makeStyles({
  box: {
    textAlign: "center",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "90%",
  },
  root: {
    padding: 0,
  },
});

const AmountTextLabel = ({ donateStep, formData, isVeryNarrow, label }) => {
  const formatMoneyAmount = useFormatMoney();

  if (isVeryNarrow) {
    return "";
  }

  return <>{donateStep === 1 ? formatMoneyAmount(formData.amount) : label}</>;
};

const Steps = () => {
  const { t } = useTranslation();
  const {donateStep, setDonateStep} = useDonateStep();
  const [formData] = useData();

  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const currency = donateConfig.currency;
  const isVeryNarrow = useIsVeryNarrow();

  const classes = stepperStyles();

  return (
    <Box className={classes.box}>
      <Stepper activeStep={donateStep} classes={{ root: classes.root }}>
        <Step
          key="amount"
          onClick={() => {
            setDonateStep(0);
            goStep("Donation");
          }}
        >
          <StyledStepLabel>
            <AmountTextLabel
              donateStep={donateStep}
              formData={formData}
              currency={currency}
              isVeryNarrow={isVeryNarrow}
              label={t("Amount")}
            />
          </StyledStepLabel>
        </Step>
        <Step key="payment">
          <StyledStepLabel>{isVeryNarrow ? "" : "Payment"}</StyledStepLabel>
        </Step>
      </Stepper>
    </Box>
  );
};

export default Steps;
