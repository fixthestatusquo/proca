import i18n from "../../lib/i18n";
import React, { useState, useEffect } from "react";
import { Button, Grid, Snackbar, Box, Container } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import eciLocale from "locales/eci";
import documents from "../../data/document_number_formats.json";
import { addSupport } from "../../lib/eci/server.js";

import Country from "./Country";
import General from "./General";
import Address from "./Address";
import Consent from "./Consent";
import Id from "./Id";
import useElementWidth from "../../hooks/useElementWidth";
import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";
import Alert from "@material-ui/lab/Alert";

import { makeStyles } from "@material-ui/core/styles";
import HCaptcha from "@hcaptcha/react-hcaptcha";

//import Address from './Address';
//import Id from './Id';

const removeDotKey = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      removeDotKey(obj[key]);
    }
    if (key.includes(".")) {
      obj[key.replace(/\./g, "_")] = obj[key];
      delete obj[key];
    }
  });
  return obj;
};

//const countries = eciLocale.common.country;

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  notice: {
    fontSize: theme.typography.pxToRem(13),
    fontWeight: "fontWeightLight",
    lineHeight: "1.3em",
    color: theme.palette.text.secondary,
    "& a": {
      color: theme.palette.text.secondary,
    },
  },
}));

export default (props) => {
  const classes = useStyles();

  const width = useElementWidth("#proca-register");
  const [token, setToken] = useState("dummy");
  const [compact, setCompact] = useState(true);
  const [require, setRequire] = useState(false);
  const [acceptableIds, setIds] = useState({});
  const [status, setStatus] = useState("default");

  const { t } = useTranslation("common", {
    i18n: i18n.addResourceBundle("en", "eci", removeDotKey(eciLocale)),
  });
  const config = useCampaignConfig();
  const [data] = useData();

  const form = useForm({
    defaultValues: data,
  });

  const { handleSubmit, setError, clearErrors, formState, watch } = form;

  const nationality = watch("nationality") || "";
  useEffect(() => {
    if (nationality && nationality !== "ZZ") {
      const ids = documents[nationality.toLowerCase()];
      setIds(documents[nationality.toLowerCase()]);
      clearErrors("documentNumber");
      setRequire(Object.keys(ids).length ? "id" : "address");
    }
  }, [nationality, clearErrors]);

  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const onSubmit = async (data) => {
    if (Object.keys(acceptableIds).length === 1) {
      data.documentType = Object.entries(acceptableIds)[0][0];
    }
    data.tracking = {};
    //    data.tracking = Url.utm();

    const result = await addSupport(
      config.actionType || "support", //todo: introduce a test action
      config.component.eci.actionpage,
      data,
      { captcha: token }
    );

    if (result.errors) {
      let handled = false;
      console.log(result.errors.fields, data);
      if (result.errors.fields) {
        result.errors.fields.forEach((field) => {
          if (field.name in data) {
            switch (field.name) {
              case "birthDate": {
                const msg = "eci:form.error.oct_error_invalidrange";
                setError(field.name, { type: "server", message: t(msg) });
                break;
              }
              case "documentNumber": {
                const msg =
                  "eci:form.error.document_" +
                  data.nationality.toLowerCase() +
                  "_" +
                  data.documentType.replace(/\./g, "_");
                setError(field.name, { type: "server", message: t(msg) });
                break;
              }
              case "postcode": {
                const msg =
                  "eci:form.error.oct_error_" +
                  data.country.toLowerCase() +
                  "_postalcode";
                setError(field.name, {
                  type: "server",
                  message: i18n.exists(msg)
                    ? t(msg)
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
      !handled && setStatus("error");
      return;
    }

    props.done &&
      props.done({
        firstname: data.firstname,
      });

    return false;
  };

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    //    register({ name: "country" });
    // todo: workaround until the feature is native react-form ?
    inputs.forEach((input) => {
      input.oninvalid = (e) => {
        setError(e.target.attributes.name.nodeValue, {
          type: e.type,
          message: e.target.validationMessage,
        });
      };
    });
  }, [setError, nationality]);

  const handleVerificationSuccess = (token) => {
    setToken(token);
  };

  function Error(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            Sorry, we couldn't save your signature!
            <br />
            The techies have been informed.
          </Alert>
        </Snackbar>
      );
    return null;
  }

  // todo, convert the OCS text into something that can use Trans
  return (
    <Container component="main" maxWidth="sm">
      <Box marginBottom={1}>
        <Grid container spacing={1}>
          <form
            className={classes.container}
            id="proca-register"
            onSubmit={handleSubmit(onSubmit)}
            method="post"
            url="http://localhost"
          >
            <Error display={status === "error"} />
            <Country form={form} countries={eciLocale.common.country} />
            <Box
              className={classes.notice}
              dangerouslySetInnerHTML={{
                __html: t("eci:common.requirements.text", {
                  url:
                    "https://eur-lex.europa.eu/legal-content/en/TXT/PDF/?uri=CELEX:32019R0788",
                }),
              }}
            />
            <General
              form={form}
              birthdate={require === "address"}
              compact={compact}
            />
            {require === "address" && <Address form={form} compact={compact} />}
            {require === "id" && (
              <Id
                form={form}
                compact={compact}
                ids={acceptableIds}
                country={nationality}
              />
            )}
            <Consent form={form} />
            <HCaptcha
              sitekey="aa0f1887-8dc5-4895-a8ac-fd5537984ca3"
              languageOverride={config.lang}
              onVerify={(token) => handleVerificationSuccess(token)}
            />
            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                size="large"
                disabled={formState.isSubmitting}
                endIcon={<SendIcon />}
              >
                {" "}
                {t("eci:form.support")}
              </Button>
            </Grid>
            <Box className={classes.notice} m={1}>
              <div>{t("eci:form.support-footer1")}</div>
              <div>{t("eci:form.support-footer2")}</div>
              <div>{t("eci:form.support-footer3")}</div>
            </Box>
          </form>
        </Grid>
      </Box>
    </Container>
  );
};
