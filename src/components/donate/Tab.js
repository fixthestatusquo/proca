import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";

import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaypalIcon from "@images/Paypal.js";
import makeStyles from '@mui/styles/makeStyles';

import Stripe from "./Stripe";
import Sepa from "./Sepa";
import Paypal from "./Paypal";
import { useCampaignConfig } from "@hooks/useConfig.js";
import useData from "@hooks/useData.js";
import { create as createURL } from "@lib/urlparser.js";

const useStyles = makeStyles(() => ({
  tabRoot: {
    minWidth: 10,
  },
}));

export default function Target(props) {
  const [value, setValue] = useState("stripe");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const classes = useStyles();
  const config = useCampaignConfig();
  const [requestData] = useData();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  //                startIcon={<PaymentIcon />}
  //                startIcon={<AccountBalanceIcon />}
  //                <ButonPaypal />

  const done = (d) => {
    // console.log(d);

    if (config?.completed_redirect_url) {
      window.location = createURL(
        window.location,
        config.completed_redirect_url,
        {
          firstName: requestData.firstName,
          amount: requestData.amount,
          currency: requestData.currency.code,
        }
      );
    }

    setSubmitted(true);

    props.done(d);
  };

  return (
    <>
      {submitted && <Alert severity="success">{t("Thank you")}</Alert>}
      <Paper square>
        <AppBar position="static" color="default">
          <Tabs
            variant="fullWidth"
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleChange}
            aria-label="disabled tabs example"
          >
            <Tab
              classes={{ root: classes.tabRoot }}
              value="stripe"
              label="Card"
              aria-label="Stripe"
              icon={<PaymentIcon />}
            />
            <Tab
              value="sepa"
              classes={{ root: classes.tabRoot }}
              label="Sepa"
              aria-label="Sepa"
              icon={<AccountBalanceIcon />}
            />
            <Tab
              classes={{ root: classes.tabRoot }}
              value="paypal"
              label="Paypal"
              aria-label="Paypal"
              icon={<PaypalIcon />}
            />
          </Tabs>
        </AppBar>
        <Box p={1}>
          {value === "stripe" && <Stripe done={done} />}
          {value === "sepa" && <Sepa done={done} />}
          {value === "paypal" && <Paypal done={done} />}
        </Box>
      </Paper>
    </>
  );
}
