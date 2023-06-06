import { useCallback, useLayoutEffect, useState } from "react";
import PaypalIcon from "../images/Paypal.js";
import { addAction, addDonateContact } from "@lib/server.js";
import { useCampaignConfig } from "@hooks/useConfig";
import Url from "@lib/urlparser.js";
import uuid from "@lib/uuid";

let buttons;

const usePaypal = ({ completed, failed, amount, campaign, dom, formData }) => {
  const [loadState, setLoadState] = useState({ loading: false, loaded: false });
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  // const formData = useData();

  const addClick = useCallback(
    (event, payload) => {
      addAction(config.actionPage, event, {
        uuid: uuid(),
        //        tracking: Url.utm(),
        payload: payload,
      });
    },
    [config]
  );

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

  const donationStart = (data, actions) => {
    console.log("donationStart", actions);
    addClick("donation_start", {
      source: data.fundingSource,
      amount: amount,
    });
  };

  const donationError = (err) => {
    console.log("onError", err);
    failed({
      message:
        "There was a problem processing your donation. If you'd like to try again, just click the PayPal button again.",
      error: err,
    });
    addClick("donation_error", {
      source: "paypal",
      amount: amount,
    });
  };

  const donationCancel = (data, actions) => {
    console.log("onCancel", data, actions);
    failed({
      message:
        "Oops, changed your mind? If you'd like to continue, just click the Paypal button again.",
    });
    addClick("donation_cancel", {
      source: "paypal",
      amount: amount,
    });
  };

  const sharedParameters = {
    commit: true,
    onClick: donationStart,
    onError: donationError,
    onCancel: donationCancel,
    style: {
      shape: "rect",
      color: "silver",
      size: "responsive",
      height: 30,
      layout: "vertical",
      label: "paypal",
      ...(donateConfig?.paypal?.styles || {}),
    },
  };

  const renderSubscriptionButton = useCallback(() => {
    const paypal = window.paypal;

    // TODO: You can't dynamically modify the billing cycle unit (weeks, months, etc)
    //       so we need to configure and use multiple plans here
    const plan_id = donateConfig.paypal.planId;

    buttons = paypal.Buttons({
      fundingSource: paypal.FUNDING.PAYPAL,
      createSubscription: function (data, actions) {
        return actions.subscription.create({
          plan_id: plan_id,
          quantity: Math.floor(amount * 100).toString(), // PayPal wants a string
          application_context: {
            shipping_preference: "NO_SHIPPING",
          },
        });
      },
      onApprove: async function (paypalResponse, actions) {
        const order = await actions.order.get();
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
            order: order,
            formValues: formData,
          },
        };

        if (config.test) procaRequest.donation.payload.test = true;

        procaRequest.tracking = Url.utm();

        const procaResponse = await addDonateContact(
          "paypal",
          config.actionPage,
          procaRequest
        );

        completed(procaResponse);
      },
      ...sharedParameters,
    });
    document.querySelector(dom || "#paypal-container").innerHTML = "";
    buttons.render(dom || "#paypal-container");

    return () => {
      // https://github.com/paypal/paypal-checkout-components/issues/1506

      try {
        if (buttons && buttons.close) {
          buttons.close();
        }
      } catch (e) {
        console.error("Ignore error trying to close PayPal buttons", e);
      }
    };
  }, [
    amount,
    completed,
    config.actionPage,
    config.test,
    dom,
    donateConfig.paypal.planId,
    formData,
    sharedParameters,
  ]);

  const renderOneOffButton = useCallback(() => {
    const paypal = window.paypal;

    buttons = paypal.Buttons({
      createOrder: function (data, actions) {
        console.debug("create donation", data);
        return actions.order.create({
          purchase_units: [{ amount: { value: parseFloat(amount) } }],
          description: campaign || "Donation",
          application_context: {
            shipping_preference: "NO_SHIPPING",
          },
        });
      },
      fundingSource: paypal.FUNDING.PAYPAL,
      onApprove: async function (data, actions) {
        const don = await actions.order.capture();
        console.log("onApprove paypalResponse OneOff", don);

        const procaRequest = {
          ...formData,
          uuid: uuid(false),
          tracking: Url.utm(),
        };

        _addContactFromPayPal(procaRequest, don.payer);

        const purchased = don.purchase_units[0];

        procaRequest.donation = {
          amount: Math.floor(purchased.amount.value * 100),
          currency: purchased.amount.currency_code,
          payload: {
            // onApprove: data,
            order: don,
            values: formData,
          },
        };

        const procaResponse = await addDonateContact(
          "paypal",
          config.actionPage,
          procaRequest
        );
        completed(procaResponse);
      },

      onError: function (err) {
        addClick("donation_error", {
          source: "paypal",
          amount: amount,
        });
        console.log("error", err);
      },
      style: {
        shape: "rect",
        color: "silver",
        size: "responsive",
        height: 30,
        layout: "vertical",
        label: "paypal",
        ...(donateConfig?.paypal?.styles || {}),
      },
    });
    document.querySelector(dom || "#paypal-container").innerHTML = "";
    buttons.render(dom || "#paypal-container");
  }, [
    addClick,
    amount,
    campaign,
    completed,
    config.actionPage,
    dom,
    donateConfig.paypal.styles,
    formData,
  ]);

  useLayoutEffect(() => {
    if (!amount || amount === 0 || loadState.loading) return;

    const isSubscription = formData.frequency !== "oneoff";
    if (isSubscription && formData.frequency !== "monthly") {
      throw Error("Only 'monthly' with Paypal for now.");
    }

    if (loadState.loaded) {
      return isSubscription ? renderSubscriptionButton() : renderOneOffButton();
    }

    setLoadState({ loading: true, loaded: false });
    const script = document.createElement("script");

    if (!donateConfig?.paypal?.clientId) return;

    //TODO: merchant-id:XXX or data-partner-attribution-id

    const search = new URLSearchParams();
    search.append("components", "buttons");
    search.append("currency", donateConfig.currency.code);
    console.log(config.component.donation.paypal.clientId);
    search.append("client-id", config.component.donation.paypal.clientId);
    if (isSubscription) {
      search.append("intent", "subscription");
      search.append("vault", "true");
    }

    const src = new URL("https://www.paypal.com/sdk/js");
    src.search = search;
    script.src = src;
    script.async = true;

    script.addEventListener("load", function () {
      setLoadState({ loading: false, loaded: true });
    });

    document.body.appendChild(script);

    return () => {
      // https://github.com/paypal/paypal-checkout-components/issues/1506

      try {
        if (buttons && buttons.close) {
          buttons.close();
        }
      } catch (e) {
        console.error("Ignore error trying to close PayPal buttons", e);
      }
    };
  }, [
    loadState,
    completed,
    amount,
    campaign,
    dom,
    config.component.donation.paypal.clientId,
    donateConfig.currency.code,
    donateConfig.paypal.clientId,
    formData.frequency,
    renderOneOffButton,
    renderSubscriptionButton,
  ]);

  return amount > 0 ? "span" : PaypalIcon;
};
export default usePaypal;
