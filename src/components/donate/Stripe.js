import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField as LayoutTextField,
  Grid,
  CardHeader,
  Button,
  Container,
  FormHelperText,
} from "@material-ui/core";

//import TextField from "../TextField";
// We can't use the goodies of our material ui wrapper, because it triggers too many redraw and sometimes clear the stripe field (credit cards when it shouldn't)

import { loadStripe } from "@stripe/stripe-js";
import { v4 as uuidv4 } from "uuid";

import { useLayout } from "../../hooks/useLayout";
import { makeStyles } from "@material-ui/core/styles";
import useElementWidth from "../../hooks/useElementWidth";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useTranslation } from "react-i18next";
//import SendIcon from "@material-ui/icons/Send";
import LockIcon from "@material-ui/icons/Lock";
import {
  addActionContact,
  stripeCreatePaymentIntent,
} from "../../lib/server.js";
import ChangeAmount from "./ChangeAmount";
import PaymentBox from "./PaymentBox";

import {
  useStripe,
  Elements,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import StripeInput from "./StripeInput";

import Country from "../Country";

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
}));

const publishableKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

console.assert(
  typeof publishableKey !== "undefined",
  "you need to set up a REACT_APP_STRIPE_PUBLIC_KEY and proca-donate"
);

const stripe = loadStripe(publishableKey);
const stripeSessionId = uuidv4();

const PaymentForm = (props) => {
  const layout = useLayout();
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [stripeError, setStripeError] = useState(false);
  const [data, _] = useData();

  const form = useForm({
    defaultValues: {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      postcode: data.postcode,
      country: data.country,
    },
  });

  const { control, errors, handleSubmit } = form;
  const [compact, setCompact] = useState(true);

  const width = useElementWidth("#proca-donate");

  if ((compact && width > 440) || (!compact && width <= 440))
    setCompact(width <= 440);

  const title = data.amount
    ? config.component?.donation.igive ||
      t("I'm donating") + " " + data.amount + data.currency?.symbol
    : config.component?.Donate?.amount?.title ||
      t("Choose your donation amount");

  const elements = useElements();
  const classes = useStyles();
  const stripe = useStripe();

  // const onError = (errors, e) => console.log(errors, e);
  const onSubmit = async (event, _) => {
    // avoid double clicks
    const submitButton = document.forms[0].submit;
    submitButton.disabled = true;

    event.preventDefault();

    const values = form.getValues();

    if (!props.stripe || !elements) {
      console.error("Stripe not loaded");
      return false;
    }

    const cardElement = elements.getElement(CardElement);

    const orderComplete = async (paymentIntent) => {
      // TODO: cleanup what information needs to be saved
      await addActionContact("donate", config.actionPage, {
        ...data,
        ...values,
        ...paymentIntent,
      });
      props.done(paymentIntent);
    };

    const piResponse = await stripeCreatePaymentIntent(
      config.actionPage,
      data.amount,
      data.currency.code
      // { idempotency_key: stripeSessionId }
    );

    if (piResponse.errors) {
      console.log("Error returned from proca backend", piResponse.errors);
      setStripeError({
        message: t(
          "We couldn't handle your donation at the moment. Please try again in a few minutes."
        ),
      });
      submitButton.disabled = false;
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
      }
    );

    if (stripeResponse.error) {
      console.log("error", stripeResponse);
      setStripeError(stripeResponse.error);

      // leave the button disabled - the card must have a problem
      return false;
    }

    orderComplete(stripeResponse.paymentIntent);

    // leave button disabled - we're done!
    return true;
  };

  const CustomCardElement = (props) => {
    const onChange = (e) => {
      const buttons = document.getElementsByClassName("submit-button");
      if (buttons.length === 0) return;
      const button = buttons[0];
      if (e.complete) {
        button.classList.remove("Mui-disabled");
        button.disabled = false;
      } else {
        button.classList.add("Mui-disabled");
        button.disabled = true;
      }
      console.log("event", e);
    };

    return (
      <CardElement
        {...props}
        options={{ hidePostalCode: true }}
        onChange={onChange}
      />
    );
  };
  const StripeCard = (props) => {
    return (
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
              stripe: props.stripe,
            },
          }}
        />
      </Grid>
    );
  };

  return (
    <form id="proca-donate" onSubmit={onSubmit}>
      <Container component="main" maxWidth="sm">
        <PaymentBox>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <CardHeader title={title} />
            </Grid>

            <Grid item xs={12} sm={compact ? 12 : 6}>
              <Controller
                control={control}
                name="firstname"
                render={({ onChange, value }) => (
                  <LayoutTextField
                    label={t("First name")}
                    className={classes.textField}
                    autoComplete="given-name"
                    required
                    error={!!(errors && errors["firstname"])}
                    helperText={
                      errors &&
                      errors["firstname"] &&
                      errors["firstname"].message
                    }
                    variant={layout.variant}
                    margin={layout.margin}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <Controller
                control={control}
                name="lastname"
                render={({ onChange, value }) => (
                  <LayoutTextField
                    label={t("Last name")}
                    className={classes.textField}
                    autoComplete="family-name"
                    required
                    error={!!(errors && errors["lastname"])}
                    helperText={
                      errors && errors["lastname"] && errors["lastname"].message
                    }
                    variant={layout.variant}
                    margin={layout.margin}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="email"
                render={({ onChange, value }) => (
                  <LayoutTextField
                    className={classes.textField}
                    label={t("Email")}
                    autoComplete="email"
                    type="email"
                    placeholder="your.email@example.org"
                    required
                    error={!!(errors && errors["email"])}
                    helperText={
                      errors && errors["email"] && errors["email"].message
                    }
                    variant={layout.variant}
                    margin={layout.margin}
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 4}>
              <Controller
                control={control}
                name="postcode"
                render={({ onChange, value }) => (
                  <LayoutTextField
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
                render={({ onChange, value }) => (
                  <Country
                    form={form}
                    required
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </Grid>
            {stripeError ? (
              <Grid item xs={12}>
                <FormHelperText error={true}>
                  {stripeError.message}
                </FormHelperText>
              </Grid>
            ) : (
              ""
            )}
            <StripeCard stripe={props.stripe} />
            <Grid item xs={12}>
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
                startIcon={<LockIcon />}
                disabled // start disabled, see CustomCardElement onChange
              >
                {t("Donate {{amount}}{{currency}}", {
                  amount: data.amount,
                  currency: data.currency.symbol,
                })}
              </Button>
            </Grid>
          </Grid>
          <ChangeAmount />
        </PaymentBox>
      </Container>
    </form>
  );
};

const PaymentFormWrapper = (props) => {
  const [loadState, setLoadState] = useState({ loading: false, loaded: false });
  const config = useCampaignConfig();
  return (
    <Container component="main" id="proca-donate">
      <Grid container>
        <Elements stripe={stripe} options={config?.lang || "auto"}>
          <PaymentForm stripe={stripe} {...props} />
        </Elements>
      </Grid>
    </Container>
  );
};

export default PaymentFormWrapper;
