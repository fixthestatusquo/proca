import React from "react";

import { Button } from "@material-ui/core";
import { Grid } from "@material-ui/core";

import PaymentIcon from "@material-ui/icons/Payment";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import { makeStyles } from "@material-ui/core/styles";

import Paypal from "./Paypal.js";

const useStyles = makeStyles((theme) => ({
  button: {
    "& svg": { marginRight: "0.5em" },
  },
  paypal: {
    "& svg": {
      "& path:first-child": { fill: theme.palette.primary.contrastText }, // todo read from theme
      marginRight: "0.75em",
      marginLeft: "0.5em",
    },
  },
}));

const PaymentMethodButtons = React.memo(({ onClickStripe, onClickSepa }) => {
  const classes = useStyles();

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
      <Grid item xs={12}>
        <Paypal classes={{ root: classes.paypal }} />
      </Grid>
    </Grid>
  );
});

export default PaymentMethodButtons;
