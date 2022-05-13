import React, { useEffect, useState } from "react";

import { Container, Grid, Snackbar, TextField as LayoutTextField } from "@material-ui/core";
import useElementWidth from "@hooks/useElementWidth";
import Url from "@lib/urlparser.js";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { makeStyles } from "@material-ui/core/styles";

import TextField from "@components/TextField";
import Alert from "@material-ui/lab/Alert";

import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { addDonateContact, errorMessages } from "@lib/server.js";
import dispatch from "@lib/event.js";
import IBAN from "iban";
import DonateTitle from "./DonateTitle";
import DonateButton from "./DonateButton";
import useLayout from "../../hooks/useLayout";
import Country from "@components/Country";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

export default function Register(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const [data, setData] = useData();
  const { t } = useTranslation();

  const width = useElementWidth("#proca-sepa");
  const [status, setStatus] = useState("default");
  const [errorDetails, setErrorDetails] = useState("");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 440) || (!compact && width <= 440))
    setCompact(width <= 440);

  function Error(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            {t("donation.error.general")}
            <br />
            Details: {errorDetails}
          </Alert>
        </Snackbar>
      );
    return null;
  }

  const form = useForm({
    defaultValues: data,
  });
  const { control, errors } = form;

  const displayAmount = data.amount;
  const currency = config.component.donation.currency;
  const frequency = data.frequency;

  // why floor? maybe to avoid a weird user input? 1.34567 -> 134.567 -> 134
  let amount = Math.floor(data.amount * 100);
  if (frequency === 'weekly') {
    amount = Math.floor(amount * 4.3);
  }

  const { handleSubmit, setError } = form;

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    // todo: workaround until the feature is native react-form ?
    inputs.forEach((input) => {
      input.oninvalid = (e) => {
        setError(e.target.attributes.name.nodeValue, {
          type: e.type,
          message: e.target.validationMessage,
        });
      };
    });
  }, [setError]);

  const onSubmit = async (d) => {
    setData(d);

    const procaRequest = { ...data, ...d };
    setData('donorInput', { ...procaRequest });

    procaRequest.tracking = Url.utm();
    procaRequest.donation = {
      amount: amount,
      currency: currency.code,
      payload: {
        iban: procaRequest.IBAN,
      }
    };
    if (data.frequency) {
      // weekly means amount * 4.3 monthly, but from here on out it's a monthly
      // donation with a isWeekly flag.
      if (data.frequency === 'weekly') {
        procaRequest.donation.frequencyUnit = procaRequest.frequency = 'monthly';
        procaRequest.isWeekly = true;
        procaRequest.weeklyAmount = displayAmount;
        procaRequest.amount = amount;
      }
      else {
        procaRequest.donation.frequencyUnit = data.frequency;
      }
    }
    if (config.test) procaRequest.donation.payload.test = true;

    const result = await addDonateContact(
      "sepa",
      config.actionPage,
      procaRequest
    );
    if (result.errors) {
      let handled = false;
      console.log(result.errors.fields, data);
      if (result.errors.fields) {
        result.errors.fields.forEach((field) => {
          if (field.name in data) {
            setError(field.name, { type: "server", message: field.message });
            handled = true;
          } else if (field.name.toLowerCase() in data) {
            setError(field.name.toLowerCase(), {
              type: "server",
              message: field.message,
            });
            handled = true;
          }
        });
      }
      !handled &&
        setStatus("error") &&
        setErrorDetails(errorMessages(result.errors));
      return;
    }
    setStatus("success");
    setData(data);
    dispatch(
      "donate:complete",
      {
        payment: "sepa",
        uuid: result.contactRef,
        test: !!config.test,
        firstname: data.firstname,
        amount: amount,
        currency: currency.code,
        frequency: data.frequency || "oneoff",
        country: data.country,
      },
      data
    );
    // console.log("props ", props);
    props.done &&
      props.done({
        errors: result.errors,
        uuid: result.contactRef,
        firstname: data.firstname,
      });
  };

  const validateIBAN = (d) => {
    return IBAN.isValid(d) || t("donation.error.form.invalid.iban");
  };

  const useTitle = config.component.donation.useTitle;
  const layout = useLayout();

  return (
    <form
      className={classes.container}
      id="proca-sepa"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
    >
      <Error display={status === "error"} />
      <Container component="main">
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
              classes={classes}
              name="lastname"
              label={t("Last name")}
              autoComplete="family-name"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="email"
              rules={{ required: true, pattern: /^(.+)@(.+)\.(.+)$/ }}
              render={({ onChange, onBlur, value }) => (
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
          <Grid item xs={12} sm={compact ? 12 : 4}>
            <Controller
              control={control}
              name="postcode"
              render={({ onChange, value }) => (
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
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={compact ? 12 : 8}>
            <Controller
              control={control}
              name="country"
              rules={{ required: true }}
              render={({ onChange, value }) => (
                <Country form={form} required onChange={onChange} value={value} />
              )}
            />
          </Grid>

          {config.component?.donate?.field?.phone === true && (
            <Grid item xs={12}>
              <TextField form={form} name="phone" label={t("Phone")} />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              form={form}
              name="IBAN"
              fullWidth
              required
              register={{ validate: validateIBAN }}
            />
          </Grid>
          <Grid item xs={12} classes={{ root: classes.submitButton }}>
            <DonateButton
              amount={displayAmount}
              currency={currency}
              frequency={frequency}
              config={config}
            />
          </Grid>
        </Grid>
      </Container>
    </form>
  );
}
