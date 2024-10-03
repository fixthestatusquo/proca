import React, { useState } from "react";

import { Button, FormHelperText, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaymentIcon from "@material-ui/icons/Payment";
import Paypal from "./Paypal";
import ExternalPayment from "@components/donate/buttons/External";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles({
  button: {
    "& svg": { marginRight: "0.5em" },
  },
});

const PaymentMethodButtons = ({ onClickStripe, onClickSepa, ...props }) => {
  const classes = useStyles();
  const [errorFromPaypal, setErrorFromPaypal] = useState();
  const { t } = useTranslation();

  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  return (
    <>
      {!donateConfig.external && (
        <Typography paragraph variant="h6" gutterBottom color="textPrimary">
          {t("donation.payment_methods.intro")}
        </Typography>
      )}
      <Grid
        container
        spacing={1}
        role="group"
        aria-label="payment method"
        classes={classes.formContainers}
      >
        {donateConfig.external && <ExternalPayment classes={classes} />}
        {donateConfig.stripe ? (
          <Grid item xs={12}>
            <Button
              size="large"
              fullWidth
              disabled = {props.disabled}
              variant="contained"
              color="primary"
              classes={{ root: classes.button }}
              onClick={onClickStripe}
            >
              <PaymentIcon />
              {t("donation.payment_methods.card", { defaultvalue: "Card" })}
            </Button>
          </Grid>
        ) : null}
        {donateConfig.sepa ? (
          <Grid item xs={12}>
            <Button
              size="large"
              disabled = {props.disabled}
              fullWidth
              variant="contained"
              onClick={onClickSepa}
              color="primary"
              classes={{ root: classes.button }}
            >
              <AccountBalanceIcon />
              {t("donation.payment_methods.sepa", { defaultvalue: "SEPA" })}
            </Button>
          </Grid>
        ) : null}
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
              disabled = {props.disabled}
              onError={(error) => {
                console.log(error);
                setErrorFromPaypal(error);
              }}
              onComplete={props.onComplete}
            />
          </Grid>
        ) : null}
      </Grid>
    </>
  );
};

export default PaymentMethodButtons;
