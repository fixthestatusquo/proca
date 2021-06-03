import React, { useState } from "react";

import { CardHeader, Container, Grid } from "@material-ui/core";
import { Button, Snackbar } from "@material-ui/core";
import useElementWidth from "../../hooks/useElementWidth";
import Url from "../../lib/urlparser.js";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";

import TextField from "../TextField";
import Alert from "@material-ui/lab/Alert";
import ChangeAmount from "./ChangeAmount";
import PaymentBox from "./PaymentBox";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { addActionContact, errorMessages } from "../../lib/server.js";
import IBAN from "iban";

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
            {t("Sorry, we couldn't save")}
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
  const { handleSubmit, setError } = form;
  //  const { register, handleSubmit, setValue, errors } = useForm({ mode: 'onBlur', defaultValues: defaultValues });
  //const values = getValues() || {};
  const onSubmit = async (data) => {
    data.tracking = Url.utm();
    const result = await addActionContact(
      config.test ? "test-donate" : "donate",
      config.actionPage,
      data
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
    props.done &&
      props.done({
        errors: result.errors,
        uuid: result.contactRef,
        firstname: data.firstname,
      });
  };

  const validateIBAN = (d) => {
    return IBAN.isValid(d) || t("invalid IBAN");
  };

  return (
    <form
      className={classes.container}
      id="proca-sepa"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
    >
      <Error display={status === "error"} />
      <Container component="main" maxWidth="sm">
        <PaymentBox>
          <Grid container spacing={1}>

            <Grid item xs={12}>
              <CardHeader title={t("I'm donating") + " " + data.amount + data.currency?.symbol} />
            </Grid>

            <Grid item xs={12} sm={compact ? 12 : 6}>
              <TextField
                form={form}
                name="firstname"
                label={t("First name")}
                placeholder="eg. Leonardo"
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
                placeholder="eg. Da Vinci"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                form={form}
                name="email"
                type="email"
                label={t("Email")}
                autoComplete="email"
                required
                placeholder="your.email@example.org"
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
            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                size="large"
                startIcon={<LockIcon />}
              >
                {t("Donate {{amount}}{{currency}}", {
                  amount: data.amount,
                  currency: data.currency.symbol,
                })}
              </Button>
              <ChangeAmount />
            </Grid>
          </Grid>

        </PaymentBox>
      </Container>
    </form>
  );
}
