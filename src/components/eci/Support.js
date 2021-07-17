import i18n from "../../lib/i18n";
import Url from "../../lib/urlparser";
import dispatch from "../../lib/event";
import { formatDate } from "../../lib/date";

import React, { useState, useEffect } from "react";
import { Button, Grid, Snackbar, Box, Container } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { useTranslation, countries } from "./hooks/useEciTranslation";
import { useForm } from "react-hook-form";

import documents from "../../data/document_number_formats.json";
import { addSupport, errorMessages } from "../../lib/eci/server.js";

import Country from "./Country";
import General from "./General";
import Address from "./Address";
import Consent from "./Consent";
import Id from "./Id";
import Captcha from "./Captcha";
import useElementWidth from "../../hooks/useElementWidth";
import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";
import Alert from "@material-ui/lab/Alert";

import { makeStyles } from "@material-ui/core/styles";

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
  const [errorDetails, setErrorDetails] = useState("");

  const config = useCampaignConfig();
  const { t } = useTranslation(config.lang);
  const [data] = useData();

  const form = useForm({
    defaultValues: data,
  });

  const { handleSubmit, setError, clearErrors, formState, watch, setValue } =
    form;

  const { nationality, country } = watch(["nationality", "country"]) || "";
  useEffect(() => {
    if (nationality && nationality !== "ZZ") {
      const ids = documents[nationality.toLowerCase()];
      setIds(documents[nationality.toLowerCase()]);
      clearErrors("documentNumber");
      setRequire(Object.keys(ids).length ? "id" : "address");
      if (!country && Object.keys(ids).length === 0) {
        setValue("country", nationality);
      }
    }
  }, [country, nationality, setValue, clearErrors]);

  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const onSubmit = async (data) => {
    if (Object.keys(acceptableIds).length === 1) {
      data.documentType = Object.entries(acceptableIds)[0][0];
    }
    //data.tracking = {};
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
      config.test ? "test" : "support",
      +config.component.eci.actionpage,
      data,
      { captcha: token, apiUrl: config.component.eci.apiUrl }
    );

    if (result.errors) {
      let handled = false;
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
                setError(field.name, {
                  type: "server",
                  message: /* i18next-extract-disable-line */ t(msg),
                });
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
    dispatch("eci:complete", {
      uuid: result.contactRef,
      test: !!config.test,
      country: data.nationality,
    });

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

  const handleCaptcha = (token) => {
    setToken(token);
  };

  function Error(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            Sorry, we couldn't save your signature!
            <br />
            Details: {errorDetails}
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
          <Grid item xs={12}>
            <form
              className={classes.container}
              id="proca-register"
              onSubmit={handleSubmit(onSubmit)}
              method="post"
              url="http://localhost"
            >
              <Error display={status === "error"} />

              <Box
                variant="subtitle1"
                dangerouslySetInnerHTML={{
                  __html: t("eci:common.requirements.text", {
                    url: "https://eur-lex.europa.eu/legal-content/en/TXT/PDF/?uri=CELEX:32019R0788",
                  }),
                }}
              />
              <Country form={form} countries={countries} name="nationality" />
              <General
                form={form}
                birthdate={require === "address"}
                compact={compact}
              />
              {require === "address" && (
                <Address
                  form={form}
                  compact={compact}
                  country={nationality}
                  countries={countries}
                  geocountries={config.component.eci.geocountries}
                />
              )}
              {require === "id" && (
                <Id
                  form={form}
                  compact={compact}
                  ids={acceptableIds}
                  country={nationality}
                />
              )}
              <Grid item xs={12}>
                <Consent form={form} />
              </Grid>
              <Grid item xs={12}>
                <Captcha
                  form={form}
                  compact={compact}
                  onChange={(captcha) => handleCaptcha(captcha)}
                />
              </Grid>
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
        </Grid>
      </Box>
    </Container>
  );
};
