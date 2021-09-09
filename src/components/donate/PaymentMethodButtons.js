import React from "react";

import { Button } from "@material-ui/core";
import { Grid } from "@material-ui/core";

import PaymentIcon from "@material-ui/icons/Payment";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaypalIcon from "../../images/Paypal.js";
import { makeStyles } from "@material-ui/core/styles";

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

const PaymentMethodButtons = (props) => {
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
        >
          <PaymentIcon /> Card
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          size="large"
          fullWidth
          variant="contained"
          color="primary"
          classes={{ root: classes.button }}
        >
          <AccountBalanceIcon /> SEPA
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          size="large"
          fullWidth
          variant="contained"
          color="primary"
          classes={{ root: classes.paypal }}
        >
          <PaypalIcon /> PayPal
        </Button>
      </Grid>
    </Grid>
  );
};

export default PaymentMethodButtons;
