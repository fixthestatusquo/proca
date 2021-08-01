import React, { useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

import PaymentIcon from "@material-ui/icons/Payment";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaypalIcon from "../../images/Paypal.js";
import { makeStyles } from "@material-ui/core/styles";

import Stripe from "./Stripe";
import Sepa from "./Sepa";
import Paypal from "./Paypal";
import { useCampaignConfig } from "../../hooks/useConfig.js";
import useData from "../../hooks/useData.js";
import { create as createURL } from "../../lib/urlparser.js";
import { Grid } from "@material-ui/core";
import Steps from "./steps.js";

const useStyles = makeStyles((theme) => ({
  tabRoot: {
    minWidth: 10,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  // tabContainer: {
  //   padding: "12px",
  //   paddingTop: "0",
  //   paddingBottom: "0"
  // },
  container: {
    padding: "12px",
    paddingTop: "8px"
  }
}));

const tabStyles = makeStyles((theme) => ({
  root: {
    minWidth: 10,
    backgroundColor: theme.palette.primary.main,
    '&$selected': {
      color: theme.palette.primary.contrastText
    }
  },
  selected: {}
}));

const containingBoxStyles = makeStyles((theme) => ({
  root: {
    border: "1px solid " + theme.palette.primary.main
  }
}));

export default function Target(props) {
  const [value, setValue] = useState("stripe");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();
  const classes = useStyles();
  const tabClasses = tabStyles();
  const boxStyles = containingBoxStyles();
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
    <Container classes={{ root: boxStyles.root }}>
      {submitted && <Alert severity="success">{t("Thanks!")}</Alert>}

      <Grid container xs={12}>
        <Grid item xs={12}>
          <Steps /> {/* Hard coded for now */}
        </Grid>
      </Grid>
      <Tabs
        variant="fullWidth"
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="disabled tabs example"
        classes={{ root: classes.tabContainer }}
        borderColr
      >
        <Tab
          value="stripe"
          classes={{ root: tabClasses.root, selected: tabClasses.selected }}
          label="Card"
          aria-label="Stripe"
          icon={<PaymentIcon />}
        />
        <Tab
          value="sepa"
          classes={{ root: tabClasses.root, selected: tabClasses.selected }}
          label="Sepa"
          aria-label="Sepa"
          icon={<AccountBalanceIcon />}
        />
        <Tab
          classes={{ root: tabClasses.root, selected: tabClasses.selected }}
          value="paypal"
          label="Paypal"
          aria-label="Paypal"
          icon={<PaypalIcon />}
        />
      </Tabs>
      <Box p={1} classes={{ root: classes.container }}>
        {value === "stripe" && <Stripe done={done} />}
        {value === "sepa" && <Sepa done={done} />}
        {value === "paypal" && <Paypal done={done} />}
      </Box>
    </Container>
  );
}
