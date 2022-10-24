import {
  Button,
  FormControl,
  FormGroup,
  Grid,
  makeStyles,
  withStyles,
} from "@material-ui/core";
import useData from "../../../hooks/useData";

import React, { useState } from "react";
import { useCampaignConfig } from "../../../hooks/useConfig";
import { useForm } from "react-hook-form";
import OtherAmountInput from "../OtherAmount";
import { useTranslation } from "react-i18next";
import { useFormatMoney } from "@hooks/useFormatting";

const StyledButton = withStyles((theme) => ({
  root: {
    // padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
    fontSize: theme.typography.fontSize * 1.25,
    fontWeight: theme.typography.fontWeightMedium,
  },
}))(Button);

const AmountButton = (props) => {
  const [data, setData] = useData();
  const amount = data.amount;
  const formatMoney = useFormatMoney();

  const handleAmount = (e, amount) => {
    setData("amount", amount);
    if (props.onClick) {
      props.onClick(e, props.amount);
    }
  };

  // todo: offer this as an option? color={amount === props.amount ? "primary" : "default"}
  return (
    <StyledButton
      size="large"
      name="amount"
      color={amount === props.amount ? "primary" : "default"}
      aria-pressed={amount === props.amount}
      disableElevation={true}
      variant="contained"
      onClick={(e) => handleAmount(e, props.amount)}
      classes={props.classes}
    >
      {formatMoney(props.amount)}
    </StyledButton>
  );
};

export const OtherButton = (props) => {
  const selected = props.selected;

  return (
    <StyledButton
      color={selected ? "primary" : "default"}
      name="other"
      size="large"
      aria-pressed={selected}
      disableElevation={true}
      classes={props.classes}
      variant="contained"
      {...props}
    >
      {props.children}
    </StyledButton>
  );
};

const amountStyles = makeStyles(() => ({
  formContainers: {
    marginBottom: "1em",
  },
}));

const Amounts = () => {
  const config = useCampaignConfig();
  const [data, setData] = useData();
  const donateConfig = config.component.donation;
  const currency = donateConfig.currency;
  // TODO: adjust for currencies?
  const frequency =
    data.frequency || config.component.donation?.frequency?.default || "oneoff";
  const configuredAmounts = donateConfig?.amount || {
    oneoff: [3, 5, 10, 50, 200],
  };

  console.log(donateConfig, frequency, configuredAmounts);
  const amounts = [
    ...(configuredAmounts[frequency] || configuredAmounts["oneoff"]),
  ];

  // const amount = data.amount;
  if (data.initialAmount && !amounts.find((s) => s === data.initialAmount)) {
    amounts.push(data.initialAmount);
  }
  amounts.sort((a, b) => a - b);

  const form = useForm();
  const [showCustomField, toggleCustomField] = useState(false);
  const classes = amountStyles();
  const { t } = useTranslation();

  return (
    <>
      <Grid
        container
        className={classes.formContainers}
        spacing={1}
        role="group"
        aria-label="amount"
      >
        {amounts.map((d) => (
          <Grid xs={6} md={3} key={d} item>
            {/* Maybe we should pass AmountButton the formData handler, so that it's a simpler
               component */}
            <AmountButton
              amount={d}
              currency={currency}
              onClick={() => toggleCustomField(false)}
            />
          </Grid>
        ))}
        <Grid xs={6} md={3} key="other" item>
          <OtherButton
            onClick={() => toggleCustomField(true)}
            selected={showCustomField}
          >
            {t("Other")}
          </OtherButton>
        </Grid>
      </Grid>

      {showCustomField && (
        <FormControl fullWidth>
          <FormGroup>
            <OtherAmountInput
              form={form}
              classes={classes}
              currency={currency}
              setData={setData}
            />{" "}
          </FormGroup>
        </FormControl>
      )}
    </>
  );
};

export default Amounts;
