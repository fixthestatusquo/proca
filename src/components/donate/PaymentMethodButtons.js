import React, { useState } from "react";
import {useTranslation} from "react-i18next";

import { Button, FormHelperText, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaymentIcon from "@material-ui/icons/Payment";
import Paypal from "./Paypal";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";

const useStyles = makeStyles({
  button: {
    "& svg": { marginRight: "0.5em" },
  }
});

const PaymentMethodButtons = ({ onClickStripe, onClickStripeP24, onClickSepa, frequency, ...props }) => {
  const classes = useStyles();
  const [errorFromPaypal, setErrorFromPaypal] = useState();
  const {t} = useTranslation();
  const [{amount},] = useData();
  const disabled = typeof amount === 'undefined'

  const config = useCampaignConfig()
  const donateConfig = config.component.donation;

  return (
    <Grid
      container
      spacing={1}
      role="group"
      aria-label="payment method"
      classes={classes.formContainers}
    >
      {donateConfig.stripe ? (
        <Grid item xs={12}>
          <Button
            size="large"
            fullWidth
            variant="contained"
            color="primary"
            classes={{ root: classes.button }}
            onClick={onClickStripe}
            disabled={disabled}
          >
            <PaymentIcon /> {t('campaign:donation.payment_methods.card', {defaultValue: 'Card'})}
          </Button>
        </Grid>) : null}
      {donateConfig.stripe && config.lang === 'pl' && frequency === "oneoff" ? (
       <Grid item xs={12}>
        <Button
          size="large"
          fullWidth
          variant="contained"
          color="primary"
          classes={{ root: classes.button }}
          onClick={onClickStripeP24}
          disabled={disabled}
        >
          <AccountBalanceIcon /> {t('campaign:donation.payment_methods.bank_transfer', {defaultValue: 'Bank transfer'})}
        </Button>
       </Grid>) : null}
      {donateConfig.sepa ? (
        <Grid item xs={12}>
          <Button
            size="large"
            fullWidth
            variant="contained"
            onClick={onClickSepa}
            color="primary"
            classes={{ root: classes.button }}
            disabled={disabled}
          >
            <AccountBalanceIcon /> {t('campaign:donation.payment_methods.sepa', {defaultValue: 'SEPA'})}
          </Button>
        </Grid>) : null}
      {errorFromPaypal ? (
        <Grid item xs={12}>
          <FormHelperText className={classes.messages} error={true}>
            {errorFromPaypal.message}
          </FormHelperText>
        </Grid>
      ) : null}
      {donateConfig.paypal ? (
        <Grid item xs={12}>
          <Paypal
            onError={(error) => {
              console.log(error);
              setErrorFromPaypal(error);
            }}
            onComplete={props.onComplete}
          />
        </Grid>) : null}
    </Grid>
  );
};

export default PaymentMethodButtons;
