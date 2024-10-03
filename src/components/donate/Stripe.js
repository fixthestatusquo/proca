import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField as LayoutTextField,
  Grid,
  Box,
  Button,
  Container,
  FormHelperText,
  CircularProgress,
} from "@material-ui/core";

import TextField from "@components/TextField";
// We can't use the goodies of our material ui wrapper, because it triggers too many redraw and sometimes clear the stripe field (credit cards when it shouldn't)
import EmailField from "@components/field/Email";

//import { loadStripe } from "@stripe/stripe-js";
import useScript from "react-script-hook";

import { useLayout } from "../../hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";
import {useCompactLayout} from "@hooks/useElementWidth";

import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";
//import SendIcon from "@material-ui/icons/Send";
import LockIcon from "@material-ui/icons/Lock";
import { addDonateContact, stripeCreate } from "../../lib/server.js";
import dispatch from "../../lib/event.js";
import Url from "@lib/urlparser";

import {
  useStripe,
  Elements,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import StripeInput from "./StripeInput";

import Country from "../field/Country";
import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import DonateTitle from "./DonateTitle";
import { CallToAction } from "./DonateButton";

const STRIPE_FREQUENCY = {
  monthly: "month",
  weekly: "week",
  daily: "day",
  yearly: "year",
};

const stripeErrorAtom = atom({
  key: "stripe-error",
  default: undefined,
});

const stripeCompleteAtom = atom({
  key: "stripe-card-complete",
  default: undefined,
});

// const onError = (errors, e) => console.log(errors, e);

const CustomCardElement = (props) => {
  const setComplete = useSetRecoilState(stripeCompleteAtom);
  return (
    <CardElement
      {...props}
      options={{ hidePostalCode: true }}
      onChange={(e) => setComplete(e.complete)}
    />
  );
};
const StripeCard = () => {
  const layout = useLayout();
  const stripe = useStripe();

  return (
    <Container component="main" maxWidth="sm">
      <Grid item xs={12}>
        <LayoutTextField
          name="card"
          label=""
          variant={layout.variant}
          margin={layout.margin}
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            inputComponent: StripeInput,
            inputProps: {
              component: CustomCardElement,
              stripe: stripe,
            },
          }}
        />
      </Grid>
    </Container>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    height: "auto!important",
    width: "100%",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const PaymentForm = (props) => {
  const layout = useLayout();
  const { t } = useTranslation();
  const config = useCampaignConfig();

  if (!config.component.donation?.stripe?.productId) {
    throw Error(
      "You must configure a Stripe product id " +
        "[component.donation.stripe.productId] to use Stripe.",
    );
  }
  const stripeError = useRecoilValue(stripeErrorAtom);

  const form = props.form;
  const {
    control,
    formState: { errors },
  } = form;

  const compact = useCompactLayout("#proca-donate",400);

  const useTitle = config.component.donation.useTitle;

  const classes = useStyles();

  return (
    <Container component="main" maxWidth="sm">
      <Grid container spacing={1}>
        {useTitle && (
          <Grid item xs={12}>
            <DonateTitle showAverage={false} />
          </Grid>
        )}

        <Grid item xs={12} sm={compact ? 12 : 6}>
          <TextField
            form={form}
            name="firstname"
            label={t("First name")}
            autoComplete="given-name"
            required
          />
        </Grid>
        <Grid item xs={12} sm={compact ? 12 : 6}>
          <TextField
            form={form}
            name="lastname"
            label={t("Last name")}
            autoComplete="family-name"
            required
          />
        </Grid>
{/* 
        <Grid item xs={12} display>
          <Controller
            control={control}
            name="email"
            // KISS for email validation - something@something\.something
            rules={{ required: true, pattern: /^(.+)@(.+)\.(.+)$/ }}
            render={({ field: { onChange, onBlur, value } }) => (
              <LayoutTextField
                className={classes.textField}
                label={t("Email")}
                autoComplete="email"
                type="email"
                name="email"
                placeholder="your.email@example.org"
                required
                error={!!(errors && errors["email"])}
                helperText={
                  errors && errors["email"] && errors["email"].message
                }
                variant={layout.variant}
                margin={layout.margin}
                onChange={onChange}
                onBlur={(e) => {
                  setData(e.target.name, e.target.value);
                  onBlur(e);
                }}
                value={value}
              />
            )}
          />
        </Grid>
*/}
<EmailField form={form} required />
        <Grid item xs={12} sm={compact ? 12 : 4}>
          <Controller
            control={control}
            name="postcode"
            render={({ field: { onChange, value } }) => (
              <LayoutTextField
                name="postcode"
                className={classes.textField}
                label={t("Postal Code")}
                autoComplete="postal-code"
                error={!!(errors && errors["postcode"])}
                helperText={
                  errors && errors["postcode"] && errors["postcode"].message
                }
                variant={layout.variant}
                margin={layout.margin}
                onChange={onChange}
                value={value}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={compact ? 12 : 8}>
          <Controller
            control={control}
            name="country"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Country form={form} required onChange={onChange} value={value} />
            )}
          />
        </Grid>
        {stripeError ? (
          <Grid item xs={12}>
            <FormHelperText error={true}>{stripeError.message}</FormHelperText>
          </Grid>
        ) : (
          ""
        )}
      </Grid>
    </Container>
  );
};

const SubmitButton = (props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const setStripeError = useSetRecoilState(stripeErrorAtom);
  const stripeComplete = useRecoilValue(stripeCompleteAtom);
  const stripe = useStripe();

  const [formData] = useData();

  const elements = useElements();

  const { t } = useTranslation();
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const currency = donateConfig.currency;

  const orderComplete = async (paymentIntent, paymentConfirm) => {
    const values = props.form.getValues();
    const procaRequest = { ...formData, ...values };

    const confirmedIntent = paymentConfirm.paymentIntent;

    const payload = {
      paymentConfirm: confirmedIntent,
      paymentIntent: paymentIntent,
      formValues: values,
    };
    procaRequest.donation = {
      amount: confirmedIntent.amount,
      currency: confirmedIntent.currency.toUpperCase(),
    };
    if (formData.frequency !== "oneoff" && paymentIntent.response.items) {
      const intentResponse = paymentIntent.response;
      const subscriptionPlan = intentResponse.items.data[0].plan;

      procaRequest.donation.frequencyUnit = subscriptionPlan.interval;
      payload.subscriptionId = intentResponse.id;
      payload.subscriptionPlan = subscriptionPlan;
      payload.customerId = intentResponse.customer;
    }

    procaRequest.donation.payload = payload;
    procaRequest.tracking = Url.utm();

    if (config.test) payload.test = true;

    const procaResponse = await addDonateContact(
      "stripe",
      config.actionPage,
      procaRequest,
      config.test,
    );

    if (procaResponse.errors) {
      throw Error("Proca didn't like the request !", procaResponse.errors);
    }

    // console.log("procaResponse", procaResponse);

    dispatch(
      "donate:complete",
      {
        payment: "stripe",
        uuid: procaResponse.contactRef,
        test: !!config.test,
        firstname: formData.firstname,
        amount: formData.amount,
        currency: currency.code,
        frequency: formData.frequency || "oneoff",
        country: formData.country,
      },
      procaRequest,
    );

    props.done(paymentConfirm);
  };

  const onSubmitButtonClick = async (event) => {
    event.preventDefault();

    const btn = event.target;
    btn.disabled = true;
    setSubmitting(true);

    const form = props.form;
    if (Object.keys(form.formState.errors).length > 0) {
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    if (!stripeComplete) {
      setStripeError({ message: t("donation.error.card.missing") });
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const values = form.getValues();

    if (!props.stripe || !elements) {
      console.error("Stripe not loaded");
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const cardElement = elements.getElement(CardElement);

    const params = {
      actionPage: config.actionPage,
      amount: Math.floor(formData.amount * 100),
      currency: currency.code,
      contact: {
        name: `${formData.firstname} ${formData.lastname}`,
        email: formData.email,
        address: { country: formData.country, postal_code: formData.postcode },
      },
      stripe_product_id: config.component.donation.stripe.productId,
    };
    if (formData.frequency)
      params.frequency = STRIPE_FREQUENCY[formData.frequency];

    const piResponse = await stripeCreate(params);

    if (piResponse.errors) {
      console.log("Error returned from proca backend", piResponse.errors);
      setStripeError({
        message: t("donation.error.general"),
      });
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    const stripeResponse = await stripe.confirmCardPayment(
      piResponse.client_secret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.name,
            address: { country: values.country, postal_code: values.postcode },
            email: values.email,
          },
        },
        // expand: {},
      },
    );

    if (stripeResponse.error) {
      console.log("error", stripeResponse);
      setStripeError(stripeResponse.error);
      btn.disabled = false;
      setSubmitting(false);
      return false;
    }

    // console.debug("stripe confirm card payment response", stripeResponse);

    orderComplete(piResponse, stripeResponse);

    // leave button disabled - we're done!
    return true;
  };

  return (
    <Box mt={2}>
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
        startIcon={isSubmitting ? undefined : <LockIcon />}
        onClick={(e, data) => {
          onSubmitButtonClick(e, data);
        }}
      >
        {isSubmitting ? (
          <CircularProgress color="inherit" />
        ) : (
          <CallToAction
            amount={formData.amount}
            currency={currency}
            frequency={formData.frequency || "oneoff"}
          />
        )}
      </Button>
    </Box>
  );
};

const submitButtonStyles = makeStyles((theme) => ({
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const PayWithStripe = (props) => {
  // const stripe = useStripe();
  const form = props.form;
  const classes = submitButtonStyles();
  return (
    <form id="proca-donate">
      <Grid container>
        <Grid item xs={12}>
          <PaymentForm stripe={props.stripe} form={form} {...props} />
        </Grid>
        <Grid item xs={12}>
          <StripeCard stripe={props.stripe} />
        </Grid>
        <Grid item xs={12} classes={{ root: classes.submitButton }}>
          <SubmitButton stripe={props.stripe} form={form} {...props} />
        </Grid>
      </Grid>
    </form>
  );
};

const PaymentFormWrapper = (props) => {
  const config = useCampaignConfig();

  const [data] = useData();
  let publishableKey =
    config.component.donation?.stripe?.publicKey ||
    process.env.REACT_APP_STRIPE_PUBLIC_KEY;
  if (config.test) {
    if (config.component.donation?.stripe?.testKey) {
      publishableKey = config.component.donation.stripe.testKey;
    } else {
      console.warn ("missing config.component.donation.stripe.testKey");
    }
  }

  const [stripe, loadStripe] = useState(null);
  const [, error] = useScript({
    src: "https://js.stripe.com/v3/",
    onload: () => {
      // the object window.Stripe exists
      loadStripe(window.Stripe(publishableKey, { locale: config.lang }));
    },
  });

  const form = useForm({
    defaultValues: {
      firstname: data.firstname || "",
      lastname: data.lastname || "",
      email: data.email || "",
      postcode: data.postcode || "",
      country: data.country || "",
    },
  });

  const { t } = useTranslation();

  if (error) return <h3>{t("donation.error.initialisation")}</h3>;

  return (
    <Container component="main" id="proca-donate">
      <Elements stripe={stripe} options={config?.lang || "auto"}>
        <PayWithStripe {...props} form={form} stripe={stripe} />
      </Elements>
    </Container>
  );
};

export default PaymentFormWrapper;
