import React from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";

import ShareIcon from "@material-ui/icons/Share";
import PaymentIcon from "@material-ui/icons/Payment";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaypalIcon from "../../images/Paypal.js";

import Stripe from "./Stripe";
import Sepa from "./Sepa";
import Paypal from "./Paypal";

export default function Target(props) {
  const [value, setValue] = React.useState("stripe");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  //                startIcon={<PaymentIcon />}
  //                startIcon={<AccountBalanceIcon />}
  //                <ButonPaypal />

  return (
    <>
      <Paper square>
        <AppBar position="static" color="default">
          <Tabs
            variant="scollable"
            value={value}
            indicatorColor="primary"
            textColor="primary"
            scrollButton="auto"
            onChange={handleChange}
            aria-label="disabled tabs example"
          >
            <Tab
              value="stripe"
              label="Card"
              aria-label="Stripe"
              icon={<PaymentIcon />}
            />
            <Tab
              value="sepa"
              label="Sepa"
              aria-label="Sepa"
              icon={<AccountBalanceIcon />}
            />
            <Tab
              value="paypal"
              label="Paypal"
              aria-label="Paypal"
              icon={<PaypalIcon />}
            />
          </Tabs>
        </AppBar>
        <Box p={1}>
          {value === "stripe" && <Stripe done={props.done} />}
          {value === "sepa" && <Sepa done={props.done} />}
          {value === "paypal" && <Paypal done={props.done} />}
        </Box>
      </Paper>
    </>
  );
}
