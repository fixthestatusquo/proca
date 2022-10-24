import i18n from "@lib/i18n";
import Url from "@lib/urlparser";
import dispatch from "@lib/event";
import { formatDate } from "@lib/date";
import { ReactComponent as ECLogo } from "@images/logo_eu.svg";
import { ReactComponent as SecureLogo } from "@images/secure.svg";
import React, { useState, useEffect } from "react";
import {
  CardHeader,
  Button,
  Grid,
  Snackbar,
  Box,
  Container,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { useTranslation, countries } from "./hooks/useEciTranslation";
import { useForm } from "react-hook-form";

import documents from "@data/document_number_formats.json";
import { addSupport, errorMessages } from "@lib/eci/server.js";

import Reminder from "./Reminder";
import Country from "./Country";
import General from "./General";
import Address from "./Address";
import Consent from "./Consent";
import Id from "./Id";
import Captcha from "./Captcha";
import ReadMore from "./ReadMore";
import useElementWidth from "@hooks/useElementWidth";
import useData from "@hooks/useData";
import { useCampaignConfig } from "@hooks/useConfig";
import Alert from "@material-ui/lab/Alert";
import useCount from "@hooks/useCount";
import ProgressCounter from "@components/ProgressCounter";
import { makeStyles } from "@material-ui/core/styles";

//const countries = eciLocale.common.country;

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiInputLabel-root": {
      color: "red",
    },
  },
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

const Support = (props) => {
  const classes = useStyles();

  const width = useElementWidth("#proca-register");
  const [token, setToken] = useState({ text: "dummy", audio: false });
  const [compact, setCompact] = useState(true);
  const [require, setRequire] = useState(false);
  const [acceptableIds, setIds] = useState({});
  const [status, setStatus] = useState("default");
  const [reload, setReload] = useState("false");
  const [errorDetails, setErrorDetails] = useState("");

  const config = useCampaignConfig();
  const { t } = useTranslation(config.lang);
  const [data] = useData();

  const apiUrl = config.component.eci.apiUrl || process.env.REACT_APP_API_URL;

  const actionpage = config.component.eci.actionpage || config.actionPage;
  const progress = config.component.eci.progress;

  useCount(actionpage); // TODO, make conditional to fetch the counter?
  //config.component.eci.apiUrl

  const form = useForm({
    mode: "onBlur",
    defaultValues: data,
  });

  const { handleSubmit, setError, clearErrors, formState, watch, setValue } =
    form;

  const [ nationality, country, firstname ] =  // react-hook-form 7: array of inputs returns array instead of object
    watch(["nationality", "country", "firstname"]) || "";

  if (data.firstname && !firstname && !reload) {
    setReload("true");
  }

  useEffect(() => {
    if (reload) {
      data.firstname && setValue("firstname", data.firstname);
      data.lastname && setValue("lastname", data.lastname);
      data.country && setValue("nationality", data.country);
      data.country && setValue("country", data.country);
      setReload(false);
    }
    // eslint-disable-next-line
  }, [reload, setValue]);

  useEffect(() => {
    if (
      nationality &&
      nationality !== "ZZ" &&
      documents[nationality.toLowerCase()]
    ) {
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

    const result = await addSupport("support", +actionpage, data, {
      captcha: token,
      apiUrl: apiUrl,
      test: config.test,
    });
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
      if (!handled) {
        setErrorDetails(errorMessages(result.errors));
        setStatus("error");
      }
      return;
    }
    if (status === "error") {
      setErrorDetails("");
      setStatus("default");
    }
    dispatch(
      "eci:complete",
      {
        uuid: result.contactRef,
        test: !!config.test,
        country: data.nationality,
      },
      null,
      config
    );

    props.done &&
      props.done({
        firstname: data.firstname,
      });

    return false;
  };

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

  const customValidity = t("required field");

  // todo, convert the OCS text into something that can use Trans
  return (
    <Container component="div" maxWidth="sm">
      {progress && (
        <ProgressCounter actionPage={config.component.eci.actionpage} />
      )}
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

              {i18n.exists("step.eci.secure") && (
                <Grid container spacing={4}>
                  <Grid item xs={10}>
                    {t("step.eci.secure")}
                  </Grid>
                  <Grid item xs={2}>
                    <SecureLogo />
                  </Grid>
                </Grid>
              )}
              {config.component.reminder && <Reminder done={props.done} />}
              {i18n.exists("step.eci.title") && (
                <CardHeader
                  subheader={t("step.eci.subheader", "")}
                  title={t("step.eci.title", "")}
                ></CardHeader>
              )}
              {config.component.eci.readMore && <ReadMore />}
              <Box
                variant="subtitle1"
                dangerouslySetInnerHTML={{
                  __html: t("eci:common.requirements.text", {
                    url:
                      "https://eur-lex.europa.eu/legal-content/" +
                      config.lang +
                      "/TXT/PDF/?uri=CELEX:32019R0788",
                  }),
                }}
              />
              <Country form={form} countries={countries} name="nationality" />
              <General
                form={form}
                birthdate={require === "address"}
                compact={compact}
                customValidity={customValidity}
              />
              {require === "address" && (
                <Address
                  form={form}
                  compact={compact}
                  country={nationality}
                  countries={countries}
                  geocountries={config.component.eci.geocountries}
                  customValidity={customValidity}
                />
              )}
              {require === "id" && (
                <Id
                  form={form}
                  compact={compact}
                  ids={acceptableIds}
                  country={nationality}
                  customValidity={customValidity}
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
                <Grid container spacing={2}>
                  <Grid xs={3} item>
                    <ECLogo />
                  </Grid>
                  <Grid xs={9} item>
                    <div>{t("eci:form.support-footer1")}</div>
                    <div>{t("eci:form.support-footer2")}</div>
                    <div>{t("eci:form.support-footer3")}</div>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Support;
