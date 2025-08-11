import React, { useState } from "react";

import { Container, Grid } from "@material-ui/core";
import useElementWidth from "@hooks/useElementWidth";
import Url from "@lib/urlparser.js";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { makeStyles } from "@material-ui/core/styles";
import { formatDate } from "@lib/date";

import { Box, Button, Snackbar } from "@material-ui/core";
import TextField from "@components/field/TextField";
import Alert from "@material-ui/lab/Alert";

import ProcaIcon from "@images/Proca";
import SvgIcon from "@material-ui/core/SvgIcon";
import DoneIcon from "@material-ui/icons/Done";

import { useForm } from "react-hook-form";
import i18n from "@lib/i18n";
import { useTranslation } from "@components/eci/hooks/useEciTranslation";

import Consent from "./Consent";
import EmailConsent from "@components/Consent";
import documents from "@data/document_number_formats.json";

import Id from "@components/eci/Id";
import Address from "@components/eci/Address";
import General from "@components/eci/General";
import ProgressCounter from "@components/ProgressCounter";

import { addSupport, errorMessages } from "./lib/server.js";
//import uuid from "@lib/uuid.js";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%",
  },
  act: {
    "&:hover": {
      "& .flame": { fill: "url(#a)" },
      "& .arrow": { fill: "#fff" },
      "& nope.circle": { fill: "#ff5c39", fillOpacity: 1 },
    },
  },

  "#petition-form": { position: "relative" },
  "@global": {
    "select:-moz-focusring": {
      color: "transparent",
      textShadow: "0 0 0 #000",
    },
    "input:invalid + fieldset": {},
  },
}));

export default function Register(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const [data] = useData();
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const [token, setToken] = useState("dummy");
  const [errorDetails, setErrorDetails] = useState("");

  const { t } = useTranslation();

  const width = useElementWidth("#proca-register");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);
  const acceptableIds = documents["it"];
  acceptableIds["driving.licence"] = "it";
  const [status, setStatus] = useState("default");
  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: data,
  });
  const { handleSubmit, setError, formState } = form;

  const handleVerificationSuccess = token => {
    setToken(token);
  };
  const onSubmit = async data => {
    data.tracking = Url.utm();
    if (data.birthDate) {
      data.birthDate = formatDate(data.birthDate);
      if (data.birthDate === false) {
        setError("birthDate", {
          type: "format",
          message: t("eci:form.error.oct_error_invaliddateformat"),
        });
        return;
      }
    }

    const result = await addSupport(
      config.test ? "test" : config.component?.register?.actionType || "sign",
      config.actionPage,
      data,
      { captcha: token }
    );

    if (result.errors) {
      let handled = false;
      console.log(result.errors.fields, data);
      if (result.errors.fields) {
        result.errors.fields.forEach(field => {
          if (field.name in data) {
            switch (field.name) {
              case "birthDate": {
                const msg = "eci:form.error.oct_error_invalidrange";
                setError(field.name, { type: "server", message: t(msg) });
                break;
              }
              case "documentNumber": {
                const msg = `eci:form.error.document_it_${data.documentType.replace(/\./g, "_")}`;
                setError(field.name, {
                  type: "server",
                  message: /* i18next-extract-disable-line */ t(msg),
                });
                break;
              }
              case "postcode": {
                const msg = `eci:form.error.oct_error_${data.country.toLowerCase()}_postalcode`;
                setError(field.name, {
                  type: "server",
                  message: i18n.exists(msg)
                    ? /* i18next-extract-disable-line */ t(msg)
                    : t("eci:form.error.oct_error_invalidsize"),
                });
                break;
              }
              default:
                setError(field.name, {
                  type: "server",
                  message: field.message,
                });
            }
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
        setErrorDetails(errorMessages(result.errors)) &&
        setStatus("error");
      return;
    }

    props.done &&
      props.done({
        firstname: data.firstname,
      });
    //    setData (data);
    return false;
  };

  function ErrorS(props) {
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

  function Success(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="success">Done, Thank you for your support!</Alert>
        </Snackbar>
      );
    return null;
  }

  if (status === "success") {
    return (
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DoneIcon color="action" fontSize="large" my={4} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  return (
    <form
      className={classes.container}
      id="proca-register"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
    >
      <ProgressCounter actionPage={props.actionPage} />
      <Success display={status === "success"} />
      <ErrorS display={status === "error"} />
      <Container component="main" maxWidth="sm">
        <Box marginBottom={1}>
          <Grid container spacing={0}>
            <General form={form} birthdate={true} compact={compact} />

            <Grid item xs={12}>
              <TextField
                form={form}
                name="birthplace"
                label={t("eci:Place of birth")}
                placeholder="eg. Roma"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                form={form}
                name="email"
                type="email"
                label={t("Email")}
                autoComplete="email"
                placeholder="your.email@example.org"
              />
            </Grid>
            <Id
              form={form}
              compact={compact}
              ids={acceptableIds}
              country="it"
            />
            <Grid item xs={12}>
              <TextField
                form={form}
                name="authority"
                label="Autorità di rilascio"
                required
              />
            </Grid>
            <Address form={form} compact={compact} countries={[]} />
            <Grid item xs={12} sm={compact ? 12 : 8}>
              <Consent form={form} />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 4}>
              <HCaptcha
                sitekey={config.component.register.hcaptcha}
                languageOverride={config.lang}
                size="compact"
                onVerify={token => handleVerificationSuccess(token)}
              />
            </Grid>
            <EmailConsent
              organisation={props.organisation}
              privacy_url={config.privacyUrl}
              form={form}
            />

            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                className={classes.act}
                fullWidth
                type="submit"
                size="large"
                disabled={formState.isSubmitting}
                endIcon={
                  <SvgIcon>
                    <ProcaIcon />
                  </SvgIcon>
                }
              >
                {" "}
                {props.buttonText ||
                  /* i18next-extract-disable-line */ t(
                    config.component.register?.button || "register"
                  )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </form>
  );
}
