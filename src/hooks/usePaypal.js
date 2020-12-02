import React from "react";
import { useLayoutEffect, useState } from "react";
import PaypalIcon from "../images/Paypal.js";
import { addAction, addActionContact } from "../lib/server.js";
import { useCampaignConfig } from "../hooks/useConfig";
import Url from "../lib/urlparser.js";
import uuid from "../lib/uuid";

const usePaypal = (params) => {
  const [loadState, setLoadState] = useState({ loading: false, loaded: false });
  const config = useCampaignConfig();

  const addClick = (event, payload) => {
    addAction(config.actionPage, event, {
      uuid: uuid(),
      //        tracking: Url.utm(),
      payload: payload,
    });
  };

  useLayoutEffect(() => {
    if (!params.amount || params.amount === 0 || loadState.loading) return;

    const renderButton = () => {
      const paypal = window.paypal;
      const button = paypal.Buttons({
        createOrder: function (data, actions) {
          console.log("create donation", data, params);
          return actions.order.create({
            purchase_units: [{ amount: { value: parseFloat(params.amount) } }],
            description: params.campaign || "Donation",
          });
        },
        fundingSource: paypal.FUNDING.PAYPAL,
        commit: true,
        onClick: function (data, actions) {
          console.log("onClick", data);
          addClick("donation_start", {
            source: data.fundingSource,
            amount: params.amount,
          });

          //                return actions.reject(Error("error: onClick"));
        },
        onCancel: function (data, actions) {
          addClick("donation_cancel", {
            source: "paypal",
            amount: params.amount,
          });
        },
        onApprove: async function (data, actions) {
          const don = await actions.order.capture();
          console.log("onApprove", don);
          let d = {
            uuid: uuid(false),
            firstname: don.payer?.name?.given_name,
            lastname: don.payer?.name?.surname,
            email: don.payer?.email_address,
            phone: don.payer?.phone?.phone_number?.national_number,
            country: don.payer?.address?.country_code,
            postcode: don.payer?.address?.postal_code,
            donation_id: don.id,
            status: don.status,
          };
          if (don.purchase_units?.length && don.purchase_units[0].amount) {
            d.amount = don.purchase_units[0].amount.value;
            d.currency = don.purchase_units[0].amount.currency_code;
          }
          d.tracking = Url.utm();
          console.log(d);
          const result = await addActionContact("donate", config.actionPage, d);
          typeof params.completed === "function" && params.completed(d);
        },

        onError: function (err) {
          addClick("donation_error", {
            source: "paypal",
            amount: params.amount,
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
        },
      });
      document.querySelector(params.dom || "#paypal-container").innerHTML = "";
      button.render(params.dom || "#paypal-container");
    };

    if (loadState.loaded) {
      renderButton();
      return;
    }

    setLoadState({ loading: true, loaded: false });
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?currency=EUR&client-id=" +
      (config.test ? "sb" : config.component.paypal?.clientId || "sb");
    //TODO: merchant-id:XXX or data-partner-attribution-id
    script.async = true;
    script.addEventListener("load", function () {
      setLoadState({ loading: false, loaded: true });
    });
    document.body.appendChild(script);
    return () => {
      console.log("unload"); //document.body.removeChild(script);
    };
  }, [loadState, params]);
  return params.amount > 0 ? "span" : PaypalIcon;
};
export default usePaypal;
