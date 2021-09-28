import React, { useCallback, useState } from "react";

import Url from "../../lib/urlparser.js";
import uuid from "../../lib/uuid";

import useData from "../../hooks/useData";
import { useCampaignConfig, useSetCampaignConfig } from "../../hooks/useConfig";
import { data } from "../../lib/urlparser.js";
import { atomFamily } from "recoil";
import { PayPalButtons, FUNDING } from "@paypal/react-paypal-js";
import { addDonateContact } from "../../lib/server.js";

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

// async function onApproveSubscription(paypalResponse, actions, formData) {
//   const order = await actions.order.get();
//   const subscription = await actions.subscription.get();

//   const procaRequest = {
//     ...formData,
//     uuid: uuid(false),
//     tracking: Url.utm(),
//   };

//   _addContactFromPayPal(procaRequest, subscription.subscriber);

//   const subscriptionAmount =
//     subscription.billing_info.cycle_executions[0].total_price_per_cycle
//       .gross_amount;

//   procaRequest.donation = {
//     amount: Math.floor(Number.parseFloat(subscriptionAmount.value) * 100),
//     currency: subscriptionAmount.currency_code,
//     frequencyUnit: formData.frequency,

//     payload: {
//       response: paypalResponse,
//       subscriptionId: subscription.id,
//       customerId: subscription.payer_id,
//       subscription: subscription,
//       order: order,
//       formValues: formData,
//     },
//   };

//   // if (config.test) procaRequest.donation.payload.test = true;

//   procaRequest.tracking = Url.utm();

//   const procaResponse = await addDonateContact(
//     "paypal",
//     config.actionPage,
//     procaRequest
//   );

//   completed(procaResponse);
// }

// export const subscriptionHandler = {
//   createSubscription: function (data, actions) {
//     return actions.subscription.create({
//       plan_id: plan_id,
//       quantity: Math.floor(amount * 100).toString(), // PayPal wants a string
//       application_context: {
//         shipping_preference: "NO_SHIPPING",
//       },
//     });
//   },
//   onApproveSubscription: onApproveSubscription,

// };

// -------------- OneOff  ---------------------------------------------------

const onApproveOrder = async ({
  formData,
  actionPage,
  onComplete,
  actions,
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

  const onError = (error) => {
    console.log("onError", error);
    props.onError({
      message:
        "There was a problem processing your donation. If you'd like to try again, just click the PayPal button again.",
      error,
    });
  };

  const onCancel = (data, actions) => {
    console.log("onCancel", data, actions);
    props.onError({
      message:
        "Oops, changed your mind? If you'd like to continue, just click the Paypal button again.",
    });
  };

  const createOrder = useCallback(
    (data, actions) => {
      return onCreateOrder({
        amount: amount,
        description: description,
        data: data,
        actions: actions,
      });
    },
    [amount, description]
  );

  const approveOrder = useCallback(
    (data, actions) => {
      return onApproveOrder({
        formData: formData,
        actionPage: actionPage,
        data: data,
        actions: actions,
        onComplete: props.onComplete,
      });
    },
    [formData, actionPage, props.onComplete]
  );

  const configuredStyles = donateConfig.paypal?.styles || {};

  return (
    <>
      {" "}
      <PayPalButtons
        fundingSource={FUNDING.PAYPAL}
        commit={true} // no server-side calls
        createOrder={createOrder}
        onApprove={approveOrder}
        // createSubscription={{ createSubscription }}
        //onError={onError}
        //onCancel={onCancel}
        style={{
          ...configuredStyles,
        }}
        {...props}
      />
    </>
  );
};

export default ProcaPayPalButton;
