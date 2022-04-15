import React, { useCallback } from "react";

import Url from "../../lib/urlparser.js";
import uuid from "../../lib/uuid";

import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";
import dispatch from "../../lib/event";
import {
  PayPalButtons,
  FUNDING,
  usePayPalScriptReducer,
  DISPATCH_ACTION,
} from "@paypal/react-paypal-js";
import { addDonateContact } from "../../lib/server.js";
import { Box, Button, CircularProgress, makeStyles } from "@material-ui/core";

const _addContactFromPayPal = (setFormData, contact, payer) => {
  if (!payer) return;

  contact.firstname = payer.name?.given_name;
  contact.lastname = payer.name?.surname;
  contact.email = payer.email_address;
  contact.phone = payer.phone?.phone_number?.national_number;

  setFormData("firstname", contact.firstname);
  setFormData("lastname", contact.lastname);
  setFormData("email", contact.email);
  setFormData("phone", contact.phone);

  const address = payer?.address || payer?.shipping_address?.address;
  if (address) {
    contact.country = address?.country_code;
    contact.postcode = address?.postal_code;
  }
};

// // -------------- Subscriptions ---------------------------------------------------

async function onApproveSubscription({
  setFormData,
  formData,
  actionPage,
  paypalResponse,
  actions,
  onComplete,
  isTest,
}) {
  // const order = await actions.order.get();
  const subscription = await actions.subscription.get();

  const procaRequest = {
    ...formData,
    uuid: uuid(false),
    tracking: Url.utm(),
  };

  _addContactFromPayPal(setFormData, procaRequest, subscription.subscriber);

  const subscriptionAmount =
    subscription.billing_info.cycle_executions[0].total_price_per_cycle
      .gross_amount;

  procaRequest.donation = {
    amount: Math.floor(Number.parseFloat(subscriptionAmount.value) * 100),
    currency: subscriptionAmount.currency_code,
    frequencyUnit: formData.frequency,

    payload: {
      response: paypalResponse,
      subscriptionId: subscription.id,
      customerId: subscription.payer_id,
      subscription: subscription,
      ///order: order,
      formValues: formData,
    },
  };

  if (formData.frequency) {
    // weekly means amount * 4.3 monthly, but from here on out it's a monthly
    // donation with a isWeekly flag.
    if (formData.frequency === 'weekly') {

      procaRequest.donation.frequencyUnit = procaRequest.frequency = 'monthly';
      procaRequest.isWeekly = true;
      procaRequest.weeklyAmount = formData.amount;
      // hrm, already defined in donation...
      procaRequest.amount = procaRequest.donation.amount;
    }
    else {
      procaRequest.donation.frequencyUnit = formData.frequency;
    }
  }

  // if (config.test) procaRequest.donation.payload.test = true;

  procaRequest.tracking = Url.utm();

  const procaResponse = await addDonateContact(
    "paypal",
    actionPage,
    procaRequest
  );

  dispatch(
    "donate:complete",
    {
      payment: "paypal",
      uuid: procaResponse.contactRef,
      test: isTest,
      firstname: formData.firstname,
      amount: formData.amount,
      currency: subscriptionAmount.currency_code,
      frequency: formData.frequency || "monthly",
      country: formData.country,
    },
    procaRequest
  );

  onComplete(procaResponse);
}

// -------------- OneOff  ---------------------------------------------------

const onApproveOrder = async ({
  setFormData,
  formData,
  actionPage,
  onComplete,
  actions,
  paypalResponse,
  isTest,
}) => {
  const order = await actions.order.capture();

  const procaRequest = {
    ...formData,
    uuid: uuid(false),
    tracking: Url.utm(),
  };

  _addContactFromPayPal(setFormData, procaRequest, order.payer);

  const purchased = order.purchase_units[0];

  procaRequest.donation = {
    amount: Math.floor(purchased.amount.value * 100),
    currency: purchased.amount.currency_code,
    payload: {
      response: paypalResponse,
      order: order,
      values: formData,
    },
  };

  const procaResponse = await addDonateContact(
    "paypal",
    actionPage,
    procaRequest
  );

  dispatch(
    "donate:complete",
    {
      payment: "paypal",
      uuid: procaResponse.contactRef,
      test: isTest,
      firstname: formData.firstname,
      amount: formData.amount,
      currency: purchased.amount.currency_code,
      frequency: "oneoff",
      country: formData.country,
    },
    procaRequest
  );

  onComplete(procaResponse);
};

const onCreateOrder = ({ amount, description, data, actions }) => {
  return actions.order.create({
    purchase_units: [{ amount: { value: parseFloat(amount) } }],
    description: description,
    application_context: {
      shipping_preference: "NO_SHIPPING",
    },
  });
};

const useStyles = makeStyles({
  root: {
    borderRadius: "4px",
    backgroundColor: "#ffc439",
    color: "#003087",
    textAlign: "center",
    height: "45px",
    minHeight: "45px",
  },
});

const LoadingSpinner = () => {
  const classes = useStyles();
  const config = useCampaignConfig();
  return (
    <Button
      className="submit-button"
      name="submit"
      color="primary"
      variant={
        config.layout?.button?.submit?.variant ||
        config.layout?.button?.variant ||
        "contained"
      }
      fullWidth
      type="submit"
      size="large"
      classes={{ root: classes.root }}
    >
      <CircularProgress color="inherit" size={30} />
    </Button>
  );
};

const useFrequencyChange = (frequency) => {
  const [{ options }, dispatch] = usePayPalScriptReducer();

  let changed = false;

  // anything but oneoff is a subscription
  if (frequency !== "oneoff" && options.intent !== "subscription") {
    changed = true;
    options.intent = "subscription";
    options.vault = "true";

    // oneoff should never have intent
  } else if (frequency === "oneoff" && options.intent !== "") {
    changed = true;
    options.intent = "";
    options.value = "";
  } else {
    // noop - we're already in sync
  }

  if (changed) {
    dispatch({
      type: DISPATCH_ACTION.RESET_OPTIONS,
      value: options,
    });
  }
  return frequency;
};

const ProcaPayPalButton = (props) => {
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const [formData, setFormData] = useData();
  const description = config.campaign.title || "Donation";
  const actionPage = config.actionPage;

  // console.log("amount in ProcaPayPalButton " + formData.amount); // this *is* changing

  const classes = useStyles();

  const [{ isPending }] = usePayPalScriptReducer();

  // why do we need to use the returned value?
  const frequency = useFrequencyChange(props.frequency);

  const displayAmount = formData.amount;
  let amountToCharge = formData.amount * 100;
  if (frequency === 'weekly') {
    amountToCharge = Math.floor(amountToCharge * 4.3);
  }

  const createOrder = useCallback(
    (paypalResponse, actions) => {
      setFormData("paymentMethod", "paypal");
      // console.log("createOrder called" + formData.amount);
      return onCreateOrder({
        amount: amountToCharge,
        description: description,
        paypalResponse: paypalResponse,
        actions: actions,
        isTest: !!config.test,
      });
    },
    [amountToCharge, config.test, description, setFormData]
  );

  const approveOrder = useCallback(
    (paypalResponse, actions) => {
      return onApproveOrder({
        setFormData: setFormData,
        formData: formData,
        actionPage: actionPage,
        paypalResponse: paypalResponse,
        actions: actions,
        onComplete: props.onComplete,
        amountToCharge: amountToCharge,
        isWeekly: frequency === 'weekly',
        weeklyAmount: displayAmount
      });
    },
    [
      setFormData,
      formData,
      actionPage,
      props.onComplete,
      frequency,
      amountToCharge,
      displayAmount]
  );

  const plan_id = donateConfig.paypal.planId;

  const createSubscription = useCallback(
    (data, actions) => {
      setFormData("paymentMethod", "paypal");
      // console.log("createSubscription called" + formData.amount);
      return actions.subscription.create({
        plan_id: plan_id,
        quantity: amountToCharge.toString(), // PayPal wants a string
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      });
    },
    [amountToCharge, plan_id, setFormData]
  );

  const approveSubscription = useCallback(
    (paypalResponse, actions) => {
      return onApproveSubscription({
        paypalResponse: paypalResponse,
        actions: actions,
        setFormData: setFormData,
        formData: formData,
        onComplete: props.onComplete,
        actionPage: actionPage,
        isTest: !!config.test,
      });
    },
    [setFormData, formData, props.onComplete, actionPage, config.test]
  );

  const configuredStyles = donateConfig.paypal?.styles || {
    color: "gold", // how do I read the variant to know this?
    height: 45,
  };
  const sharedOptions = {
    fundingSource: FUNDING.PAYPAL,
    commit: true, // no server-side calls
    style: configuredStyles,
    ...props,
  };
  const orderOptions = {
    ...sharedOptions,
    createOrder: createOrder,
    onApprove: approveOrder,
  };
  const subscriptionOptions = {
    ...sharedOptions,
    createSubscription: createSubscription,
    onApprove: approveSubscription,
  };

  const buttonOptions =
    frequency === "oneoff" ? orderOptions : subscriptionOptions;

  /*
   * THIS IS SUPER IMPORTANT ! Without it, PayPal never sees the changes in
   * amount.
   *
   */
  buttonOptions['forceReRender'] = [formData.amount];

  return (
    <Box classes={{ root: classes.root }} className="proca-MuiButton-contained">
      {" "}
      {isPending ? <LoadingSpinner /> : <PayPalButtons {...buttonOptions} />}
    </Box >
  );
};

export default ProcaPayPalButton;
