import {
  Button,
  FormControl,
  FormGroup,
  Grid,
  makeStyles,
} from "@material-ui/core";
import useData from "../../../hooks/useData";

import React, { useState } from "react";
import { useCampaignConfig } from "../../../hooks/useConfig";
import { useForm } from "react-hook-form";
import OtherAmountInput from "./OtherAmount";
import { useTranslation } from "react-i18next";
import { useFormatMoney } from "@hooks/useFormatting";
import useElementWidth from "@hooks/useElementWidth";

const useStyles = makeStyles(theme => ({
  formContainers: {
    marginBottom: "1em",
  },
  root: {
    // padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
    fontSize: theme.typography.fontSize * 1.25,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const AmountButton = props => {
  const [data, setData] = useData();
  const amount = data.amount ? parseFloat(data.amount) : undefined;
  const formatMoney = useFormatMoney();
  const classes = useStyles();

  const handleAmount = (e, amount) => {
    setData("amount", amount);
    if (props.onClick) {
      props.onClick(e, props.amount);
    }
  };

  // todo: offer this as an option? color={amount === props.amount ? "primary" : "default"}
  return (
    <Button
      size="large"
      name="amount"
      color={amount === props.amount ? "primary" : "default"}
      aria-pressed={amount === props.amount}
      disableElevation={true}
      variant="contained"
      onClick={e => handleAmount(e, props.amount)}
      classes={props.classes || classes}
    >
      {formatMoney(props.amount)}
    </Button>
  );
};

export const OtherButton = props => {
  const selected = props.selected;

  return (
    <Button
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
    </Button>
  );
};

const Amounts = () => {
  const config = useCampaignConfig();
  const [data, setData] = useData();
  const donateConfig = config.component.donation || {};
  const currency = donateConfig.currency;
  // TODO: adjust for currencies?
  const frequency =
    data.frequency || donateConfig.frequency?.default || "oneoff";
  const amounts = donateConfig?.amount[frequency] || 
    [3, 5, 10, 50, 200];


  // const amount = data.amount;
  if (data.initialAmount && !amounts.find(s => s === data.initialAmount)) {
    amounts.push(data.initialAmount);
  }
  amounts.sort((a, b) => a - b);

  const form = useForm();
  const [showCustomField, toggleCustomField] = useState(false);
  const classes = useStyles();
  const { t } = useTranslation();
  const width = useElementWidth("#proca-donate");
console.log(width);
  const cols = width > 310 ? 3 : 6;
  return (
    <>
      <Grid
        container
        className={classes.formContainers}
        spacing={1}
        role="group"
        aria-label="amount"
      >
        {amounts.map(d => (
          <Grid xs={cols} key={d} item>
            {/* Maybe we should pass AmountButton the formData handler, so that it's a simpler
               component */}
            <AmountButton
              amount={d}
              currency={currency}
              onClick={() => toggleCustomField(false)}
            />
          </Grid>
        ))}
        <Grid xs={cols}  key="other" item>
          <OtherButton
            onClick={() => toggleCustomField(true)}
            classes={classes}
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
