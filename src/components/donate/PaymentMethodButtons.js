import React, { useState } from "react";

import { Button, FormHelperText, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaymentIcon from "@material-ui/icons/Payment";
import Paypal from "./Paypal";

const useStyles = makeStyles({
  button: {
    "& svg": { marginRight: "0.5em" },
  }
});

const PaymentMethodButtons = ({ onClickStripe, onClickSepa, ...props }) => {
  const classes = useStyles();
  const [errorFromPaypal, setErrorFromPaypal] = useState();

  return (
    <Grid
      container
      spacing={1}
      role="group"
      aria-label="payment method"
      classes={classes.formContainers}
    >
      <Grid item xs={12}>
        <Button
          size="large"
          fullWidth
          variant="contained"
          color="primary"
          classes={{ root: classes.button }}
          onClick={onClickStripe}
        >
          <PaymentIcon /> Card
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          size="large"
          fullWidth
          variant="contained"
          onClick={onClickSepa}
          color="primary"
          classes={{ root: classes.button }}
        >
          <AccountBalanceIcon /> SEPA
        </Button>
      </Grid>
      {errorFromPaypal ? (
        <Grid item xs={12}>
          <FormHelperText className={classes.messages} error={true}>
            {errorFromPaypal.message}
          </FormHelperText>
        </Grid>
      ) : null}
      <Grid item xs={12}>
        <Paypal
          onError={(error) => {
            console.log(error);
            setErrorFromPaypal(error);
          }}
          onComplete={props.onComplete}
        />
      </Grid>
    </Grid>
  );
};

export default PaymentMethodButtons;
