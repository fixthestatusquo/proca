import React, { useRef, useEffect, useState } from "react";

/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import useElementWidth from "@hooks/useElementWidth";
import Url from "@lib/urlparser";
import {checkMail, getDomain} from "@lib/checkMail";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { makeStyles } from "@material-ui/core/styles";

import { Container, Box, Button, Snackbar, Grid } from "@material-ui/core";
import TextField from "@components/TextField";
import Alert from "@material-ui/lab/Alert";

import { ReactComponent as ProcaIcon } from "../images/Proca.svg";
import SvgIcon from "@material-ui/core/SvgIcon";
import DoneIcon from "@material-ui/icons/Done";
import SkipNextIcon from "@material-ui/icons/SkipNext";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Consent, { ConsentProcessing } from "@components/Consent";
import ImplicitConsent from "@components/ImplicitConsent";

import Country from "@components/Country";
import CustomField from "@components/field/CustomField";

import { addActionContact } from "@lib/server.js";
import dispatch from "@lib/event.js";
import uuid, {isSet as isUuid} from "@lib/uuid.js";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  field: {
    margin: "0 !important",
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%",
  },
  next: {
    width: "100%",
    marginTop: "10px",
  },
  act: {
    "&:hover": {
      "& .flame": { fill: "url(#a)" },
      "& .arrow": { fill: "#fff" },
      "& nope.circle": { fill: "#ff5c39", fillOpacity: 1 },
    },
  },

  "@global": {
    "select:-moz-focusring": {
      color: "transparent",
      textShadow: "0 0 0 #000",
    },
    "input:invalid + fieldset": {},
  },
}));

  const ConditionalDisabled = (props) =>  {
    if (props.disabled === true)
      return (<fieldset disabled="disabled">{props.children}</fieldset>)
    return props.children;
  };
export default function Register(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const [data, setData] = useData();
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  let emailProvider = useRef (undefined); // we don't know the email provider
  const { t } = useTranslation();

  if (props.emailProvider) 
    emailProvider = props.emailProvider; // use case: if Register is called from a parent component that wants to store the email provider

  const width = useElementWidth("#proca-register");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const [status, setStatus] = useState("default");
  const _form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: props.form ? null: data,
  });

  const form = props.form || _form;

  const { trigger, handleSubmit, setError, clearErrors, formState, getValues, setValue } = form;
  //  const { register, handleSubmit, setValue, errors } = useForm({ mode: 'onBlur', defaultValues: defaultValues });
  //const values = getValues() || {};
  const comment = data.comment;

  useEffect(() => {
    setValue("comment", comment);
  }, [comment, setValue]);

  const onSubmit = async (data) => {
    if (emailProvider.current === false) {
      setError("email", { type: "mx", message: t("email.invalid_domain",{
        defaultValue: "{{domain}} cannot receive emails",
        domain:getDomain(data.email)})});
      // the email domain is checked and invalid
      return false;
    } else {
      if (emailProvider.current) data.emailProvider = emailProvider.current;
    }

    data.tracking = Url.utm();
    if (config.component.consent?.implicit) {
      data.privacy = config.component.consent.implicit === true ? "opt-in" : config.component.consent.implicit;
      // implicit true or opt-in or opt-out
    }
    let actionType = config.component?.register?.actionType || "register";
    if (props.targets) {
      data.targets = props.targets;
      actionType = "mail2target";
    }
    if (props.beforeSubmit && typeof props.beforeSubmit === 'function') {
      data = props.beforeSubmit (data);
    }

    if (isUuid()) { // they were previous actions, we associate them with the contact recorded now
      data.uuid = uuid(); 
    }
    const result = await addActionContact(actionType,
      config.actionPage,
      data,
      config.test
    );

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
    dispatch(
      (config.component?.register?.actionType || "register") + ":complete",
      {
        uuid: result.contactRef,
        test: !!config.test,
        firstname: data.firstname,
        country: data.country,
        comment: data.comment,
        privacy: data.privacy
      },
      data
    );
    setStatus("success");
    setData(data);
    if (!config.component.share?.anonymous) {
      uuid(result.contactRef); // set the global uuid as signature's fingerprint
    }
    props.done &&
      props.done({
        errors: result.errors,
        uuid: uuid(),
        firstname: data.firstname,
        country: data.country,
        privacy: data.privacy
      });
  };

  const handleClick = async (event) => {
    const result = await trigger();
    if (result) {
      if (props.onClick) {
        handleSubmit(onSubmit)(); // do not await it, it will open a warning 'firefox prevented this page to open a pop up window...
    
        props.onClick(getValues()); // how to get the data updated?
      } else {
        const r = await handleSubmit(onSubmit)();
        console.log(r);
      }

    }
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
  }, [setError]);

  function Error(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">{t("Sorry, we couldn't save")}</Alert>
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
      <Container component="div" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DoneIcon color="action" fontSize="large" my={4} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const ConsentBlock = config.component.consent?.implicit
    ? ImplicitConsent
    : Consent;

  const validateEmail = async (e) => {
    const email = e.target.value;
    if (!e.target.checkValidity())
      return; // html5 errors are handled elsewhere
    const provider = await checkMail (email);
    emailProvider.current = provider;
    if (provider === false) {
      setError("email", { type: "mx", message: t("email.invalid_domain",{
        defaultValue: "{{domain}} cannot receive emails",
        domain:getDomain(email)})});
      return false;
    } else {
      
      clearErrors("email");
    }
    //todo, create a hook and save, and handle properly the validation ;)
    return true;
    // what do we do with the provider?
  }
  


  return (
    <form
      className={classes.container}
      id="proca-register"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
    >
      <Success display={status === "success"} />
      <Error display={status === "error"} />
      <Container component="div" maxWidth="sm">
        <ConditionalDisabled disabled = {config.component.register?.disabled === true}>
        <Box marginBottom={1}>
          <Grid container spacing={1}>
            {config.component.register?.custom?.top && <CustomField compact={compact} form={form} position="top" classes={classes}/>}
            <Grid item xs={12} sm={compact ? 12 : 6} className={classes.field}>
              <TextField
                form={form}
                name="firstname"
                label={t("First name")}
                placeholder="eg. Leonardo"
                autoComplete="given-name"
                required
              />
            </Grid>
            {config.component.register?.field?.lastname !== false && 
            <Grid item xs={12} sm={compact ? 12 : 6} className={classes.field}>
              <TextField
                form={form}
                name="lastname"
                label={t("Last name")}
                autoComplete="family-name"
                placeholder="eg. Da Vinci"
                required={config.component.register?.field?.lastname?.required}
              />
            </Grid>
            }
            <Grid item xs={12} sm={(compact || config.component.register?.field?.lastname !== false) ? 12:6} className={classes.field}>
              <TextField
                form={form}
                name="email"
                onBlur={validateEmail} // todo: implement it as react hook form validation rules
                type="email"
                label={t("Email")}
                autoComplete="email"
                required
                placeholder="your.email@example.org"
              />
            </Grid>
            {config.component.register?.field?.postcode !== false && (
              <Grid
                item
                xs={12}
                sm={(compact || config.component.register?.field?.country === false  ) ? 12 : 3}
                className={classes.field}
              >
                <TextField
                  form={form}
                  name="postcode"
                  label={t("Postal Code")}
                  autoComplete="postal-code"
                  required={
                    config.component.register?.field?.postcode?.required
                  }
                />
              </Grid>
            )}
            {config.component.register?.field?.country !== false && (
              <Grid
                item
                xs={12}
                sm={(compact || config.component.register?.field?.postcode === false) ? 12 : 9}
                className={classes.field}
              >
                <Country form={form} required />
              </Grid>
            )}
            {config.component.register?.field?.phone === true && (
              <Grid item xs={12} className={classes.field}>
                <TextField form={form} name="phone" label={t("Phone")} />
              </Grid>
            )}
            {config.component.register?.field?.comment !== false && (
              <Grid item xs={12} className={classes.field}>
                <TextField
                  form={form}
                  name="comment"
                  multiline
                  maxRows="10"
                  required={config.component.register?.field?.comment?.required}
                  label={t("Comment")}
                />
              </Grid>
            )}
            {props.extraFields && props.extraFields({form:form,classes:classes})}
            {config.component.register?.custom?.bottom && <CustomField compact={compact} form={form} classes={classes}/>}

            <ConsentBlock
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
                onClick={handleClick}
                size="large"
                disabled={formState.isSubmitting || config.component.register?.disabled === true}
                endIcon={
                  <SvgIcon>
                    <ProcaIcon />
                  </SvgIcon>
                }
              >
                {" "}
                {props.buttonText ||
                  t(config.component.register?.button || "register")}
              </Button>
              {config.component.register?.next && (
                <Button
                  endIcon={<SkipNextIcon />}
                  className={classes.next}
                  variant="contained"
                  onClick={props.done}
                >
                  {t("Next")}
                </Button>
              )}
            </Grid>
            <ConsentProcessing />
          </Grid>
        </Box>
    </ConditionalDisabled>
      </Container>
    </form>
  );
}
