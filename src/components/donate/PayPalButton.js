import React, { useCallback, useState, dispatch, useEffect } from "react";

import Url from "../../lib/urlparser.js";
import uuid from "../../lib/uuid";

import useData from "../../hooks/useData";
import { useCampaignConfig, useSetCampaignConfig } from "../../hooks/useConfig";
import { data } from "../../lib/urlparser.js";
import { atomFamily } from "recoil";
import {
  PayPalButtons,
  FUNDING,
  usePayPalScriptReducer,
  DISPATCH_ACTION,
} from "@paypal/react-paypal-js";
import { addDonateContact } from "../../lib/server.js";
import { Button } from "@material-ui/core";

const _addContactFromPayPal = (contact, payer) => {
  if (!payer) return;

  contact.firstname = payer.name?.given_name;
  contact.lastname = payer.name?.surname;
  contact.email = payer.email_address;
  contact.phone = payer.phone?.phone_number?.national_number;

  const address = payer?.address || payer?.shipping_address?.address;
  if (address) {
    contact.country = address?.country_code;
    contact.postcode = address?.postal_code;
  }
};

// // -------------- Subscriptions ---------------------------------------------------

async function onApproveSubscription({
  formData,
  actionPage,
  paypalResponse,
  actions,
  onComplete,
}) {
  console.log("oh hey i'm approving thsi subscription");

  // const order = await actions.order.get();
  const subscription = await actions.subscription.get();

  const procaRequest = {
    ...formData,
    uuid: uuid(false),
    tracking: Url.utm(),
  };

  _addContactFromPayPal(procaRequest, subscription.subscriber);

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

  // if (config.test) procaRequest.donation.payload.test = true;

  procaRequest.tracking = Url.utm();

  const procaResponse = await addDonateContact(
    "paypal",
    actionPage,
    procaRequest
  );

  onComplete(procaResponse);
}

// -------------- OneOff  ---------------------------------------------------

const onApproveOrder = async ({
  formData,
  actionPage,
  onComplete,
  actions,
  paypalResponse,
}) => {
  const order = await actions.order.capture();

  const procaRequest = {
    ...formData,
    uuid: uuid(false),
    tracking: Url.utm(),
  };

  _addContactFromPayPal(procaRequest, order.payer);

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

const ProcaPayPalButton = (props) => {
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const [formData] = useData();
  const amount = formData.amount;
  const description = config.campaign.title || "Donation";
  const actionPage = config.actionPage;

  const frequency = props.frequency;
  const [{ options }, dispatch] = usePayPalScriptReducer();

  if (frequency !== "oneoff") {
    options.intent = "subscription";
    options.vault = "true";
  } else {
    options.intent = "";
    options.value = "";
  }

  useEffect(() => {
    dispatch({
      type: DISPATCH_ACTION.RESET_OPTIONS,
      value: options,
    });
  }, [frequency]);

  const createOrder = useCallback(
    (paypalResponse, actions) => {
      return onCreateOrder({
        amount: amount,
        description: description,
        paypalResponse: paypalResponse,
        actions: actions,
      });
    },
    [amount, description]
  );

  const approveOrder = useCallback(
    (paypalResponse, actions) => {
      return onApproveOrder({
        formData: formData,
        actionPage: actionPage,
        paypalResponse: paypalResponse,
        actions: actions,
        onComplete: props.onComplete,
      });
    },
    [formData, actionPage, props.onComplete]
  );

  const plan_id = donateConfig.paypal.planId;

  const createSubscription = useCallback(
    (data, actions) => {
      return actions.subscription.create({
        plan_id: plan_id,
        quantity: Math.floor(amount * 100).toString(), // PayPal wants a string
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      });
    },
    [amount, plan_id]
  );

  const approveSubscription = useCallback(
    (paypalResponse, actions) => {
      return onApproveSubscription({
        paypalResponse: paypalResponse,
        actions: actions,
        formData: formData,
        onComplete: props.onComplete,
        actionPage: actionPage,
      });
    },
    [formData, actionPage, props.onComplete]
  );

  const configuredStyles = donateConfig.paypal?.styles || {};
  const sharedOptions = {
    fundingSource: FUNDING.PAYPAL,
    commit: true, // no server-side calls
    ...configuredStyles,
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

  return (
    <>
      {" "}
      <PayPalButtons {...buttonOptions} />
    </>
  );
};

export default ProcaPayPalButton;
