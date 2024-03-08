import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

import { Container, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { TextField as MUITextField, Button, Snackbar } from "@material-ui/core";
import TextField from "@components/TextField";
import Alert from "@material-ui/lab/Alert";

import SendIcon from "@material-ui/icons/Send";
import DoneIcon from "@material-ui/icons/Done";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import ProgressCounter from "@components/ProgressCounter";
import Birthdate from "@components/field/Birthdate";
import { checkMail, getDomain } from "@lib/checkMail";
import { addActionContact } from "@lib/server.js";
import useElementWidth from "@hooks/useElementWidth";
import { useConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";

import uuid from "@lib/uuid.js";
import domparser from "@lib/domparser";
import { useInitFromUrl } from "@hooks/useCount";
import { url as postcardUrl } from "./Download";

let defaultValues = {
  firstname: "",
  lastname: "",
  email: "",
  postcode: "",
  locality: "",
  address: "",
  country: "CH",
  comment: "",
};

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
  "#petition-form": { position: "relative" },
  "@global": {
    "select:-moz-focusring": {
      color: "transparent",
      textShadow: "0 0 0 #000",
    },
    "input:valid + fieldset": {
      borderColor: "green",
      borderWidth: 2,
    },
  },
}));

export default function Register(props) {
  const classes = useStyles();
  let emailProvider = useRef(undefined); // we don't know the email provider
  const { t } = useTranslation();
  const [status, setStatus] = useState("init");
  const [config, setCampaignConfig] = useConfig();
  const [data, setData] = useData();
  const actionUrl =
    config.component.initiative.prefixActionPage +
    domparser("campaignId", config.selector);
  const [c, actionPage] = useInitFromUrl(actionUrl);
  if (status !== "error" && c && c.errors && c.errors.length >= 0) {
    setStatus("error");
  }
  const buttonRegister = config.buttonRegister || t("action.sign");
  useEffect(() => {
    if (!actionPage || actionPage === config.actionPage) return;
    setCampaignConfig((config) => {
      let d = JSON.parse(JSON.stringify(config));
      d.actionPage = actionPage;
      setStatus("default");
      return d;
    });
  }, [actionPage, setCampaignConfig, setStatus, config.actionPage]);

  defaultValues = { ...defaultValues, ...config.data };
  const width = useElementWidth("#proca-register");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const form = useForm({
    mode: "onBlur",
    defaultValues: { ...defaultValues, ...data },
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    formState,
  } = form;

  const postcode = watch("postcode");
  const locality = watch("locality");

  const [autoLocality, setLocality] = useState("");
  const [region, setRegion] = useState("");
  useEffect(() => {
    if (postcode.length !== 4) return;
    const api = "https://postcode-ch.proca.foundation/" + postcode;

    async function fetchAPI() {
      await fetch(api)
        .then((res) => {
          if (!res.ok) {
            throw Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res && res.name) {
            setLocality(res.name);
            setRegion(res.code1);
            setValue("locality", res.name);
          }
        })
        .catch(() => {
          // no error for now
          /*
          setError("postcode", {
            type: "network",
            message: (err && err.toString()) || "Network error",
          });
          */
        });
    }
    fetchAPI();
  }, [postcode, setError, setValue]);

  const options = {
    margin: config.margin || "dense",
    variant: config.variant || "filled",
  };
  //variant: standard, filled, outlined
  //margin: normal, dense
  const validateEmail = async (email) => {
    if (config.component?.register?.validateEmail === false) return true;
    if (emailProvider.current) return true; // might cause some missing validation on edge cases
    const provider = await checkMail(email);
    emailProvider.current = provider;
    if (provider === false) {
      return t("email.invalid_domain", {
        defaultValue: "{{domain}} cannot receive emails",
        domain: getDomain(email),
      });
    }
    return true;
  };

  const onSubmit = async (data) => {
    data.tracking = config.utm;
    data.region = region;
    data.country = "CH";
    data.LanguageCode = config.lang;

    data.birthdate = formatDate(data.birthdate);
    if (data.birthdate === false) {
      setError(
        "birthdate",
        "manual",
        t("error.date", "format should be DD.MM.YYYY"),
      );
      return;
    }

    data.postcardUrl = postcardUrl(data, config.param);
    if (config.component.consent?.implicit) {
      data.privacy =
        config.component.consent.implicit === true
          ? null
          : config.component.consent.implicit;
      // implicit true or opt-in or opt-out
    }
    const result = await addActionContact("register", config.actionpage, data);
    if (result.errors) {
      let handled = false;
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
      !handled && setStatus("error");
      return;
    }
    setStatus("success");
    delete data.tracking;
    delete data.privacy;

    uuid(result.contactRef); // set the global uuid as signature's fingerprint
    data.uuid = uuid();
    if (!config.actionpage) {
      setStatus("error");
      console.log(
        `Attempt to create QRCode with actionPage id = ${config.actionpage}`,
      );
    }
    data.postcardUrl += "&qrcode=" + uuid() + ":" + config.actionpage;
    setData(data);
    if (props.done instanceof Function) props.done(data);
    // sends the signature's ID as fingerprint
  };

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
  }, [register, setError]);

  const handleBlur = (e) => {
    e.target.checkValidity();
    if (e.target.validity.valid) {
      clearErrors(e.target.attributes.name.nodeValue);
      return;
    }
  };

  function formatDate(date) {
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) return date;
    if (date.length > 0) {
      if (date.length !== 10) {
        return false;
      }

      const dmj = date.split(/ |\.|\//);
      if (dmj.length !== 3) return false;
      return dmj[2] + "-" + dmj[1] + "-" + dmj[0];
    }
  }
  function minBirthdate() {
    let d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
    //    return d.toISOString().substr(0, 10);
  }

  function Error(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            Sorry, we could not save your signature!
            <br />
            The techies have been informed.
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
    <React.Fragment>
      <ProgressCounter actionPage={null} count={c && c.total} />
      <form
        className={classes.container}
        onSubmit={handleSubmit(onSubmit)}
        method="post"
        id="proca-register"
        action="http://localhost"
      >
        <Success display={status === "success"} />
        <Error display={status === "error"} />
        <Container component="main" maxWidth="sm">
          <Grid container spacing={1}>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <TextField
                form={form}
                name="firstname"
                label={t("First name")}
                placeholder="eg. Albert"
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
                className={classes.textField}
                placeholder="eg. Einstein"
                required
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <TextField
                form={form}
                name="email"
                validate={validateEmail}
                type="email"
                label={t("Email")}
                autoComplete="email"
                required
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <Birthdate form={form} min={minBirthdate()} />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 12}>
              <TextField
                form={form}
                name="address"
                label={t("Address")}
                required
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 3}>
              <MUITextField
                id="postcode"
                name="postcode"
                required
                label={t("Postal Code")}
                onBlur={handleBlur}
                inputProps={{ pattern: "[0-9]{4}", title: "9999" }}
                autoComplete="postal-code"
                error={!!errors.postcode}
                helperText={
                  errors && errors.postcode && errors.postcode.message
                }
                {...register("postcode")}
                className={classes.textField}
                variant={options.variant}
                margin={options.margin}
              />
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 9}>
              <TextField
                form={form}
                name="locality"
                label={t("Locality")}
                autoComplete="address-level2"
                InputLabelProps={{
                  shrink: autoLocality !== "" || locality !== "" || false,
                }}
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
                {buttonRegister}
              </Button>
              <input
                type="hidden"
                {...register("privacy", { required: false })}
              />
            </Grid>
          </Grid>
        </Container>
      </form>
    </React.Fragment>
  );
}

Register.propTypes = {
  actionPage: PropTypes.number.isRequired,
};
Register.defaultProps = {
  buttonText: "Register",
};
