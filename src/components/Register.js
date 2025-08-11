import React, { useRef, useEffect, useState } from "react";

/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import { useCompactLayout } from "@hooks/useElementWidth";
import Url from "@lib/urlparser";
import { setCookie } from "@lib/cookie";
import { getDomain } from "@lib/checkMail";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { makeStyles } from "@material-ui/core/styles";

import { Container, Box, Button, Snackbar, Grid } from "@material-ui/core";
import TextField from "@components/field/TextField";
import Alert from "@material-ui/lab/Alert";
import NameField from "@components/field/Name";
import EmailField from "@components/field/Email";
import PhoneField from "@components/field/Phone";
import Address from "@components/field/Address";

import ProcaIcon from "../images/Proca";
import SvgIcon from "@material-ui/core/SvgIcon";
import DoneIcon from "@material-ui/icons/Done";
import SkipNextIcon from "@material-ui/icons/SkipNext";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Consent, { ConsentProcessing } from "@components/Consent";
import ImplicitConsent from "@components/ImplicitConsent";

import WelcomeSupporter from "@components/WelcomeSupporter";
import CustomField from "@components/field/CustomField";

import { addActionContact, addAction } from "@lib/server.js";
import dispatch from "@lib/event.js";
import uuid, { isSet as isUuid } from "@lib/uuid.js";

export const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  hidden: {
    display: "none",
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
  withSubText: {
    flexDirection: "column",
  },
  subText: {
    display: "inline",
    fontSize: "0.9em",
    textTransform: "none",
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

const ConditionalDisabled = props => {
  if (props.disabled === true)
    return <fieldset disabled="disabled">{props.children}</fieldset>;
  return props.children;
};

const SubmitButton = props => {
  const classes = useStyles();
  const config = useCampaignConfig();
  const { formState, setValue, register } = props.form;
  const { t } = useTranslation();

  const handleClick = (e, privacy) => {
    setValue("privacy", privacy);
    return props.handleClick(e);
  };
  if (config.component.consent?.buttons) {
    return (
      <>
        <input type="hidden" {...register("privacy", { required: false })} />
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            classes={{ label: classes.withSubText }}
            fullWidth
            onClick={e => handleClick(e, "opt-out")}
            disabled={
              formState.isSubmitting ||
              config.component.register?.disabled === true
            }
          >
            {props.buttonText ||
              t(config.component.register?.button || "action.register")}
            <span className={classes.subText}>
              {t("consent.subButton.opt-out")}
            </span>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            color="primary"
            variant="contained"
            classes={{ label: classes.withSubText }}
            fullWidth
            onClick={e => handleClick(e, "opt-in")}
            disabled={
              formState.isSubmitting ||
              config.component.register?.disabled === true
            }
          >
            {props.buttonText ||
              t(config.component.register?.button || "action.register")}
            <span className={classes.subText}>
              {t("consent.subButton.opt-in")}
            </span>
          </Button>
        </Grid>
      </>
    );
  }

  return (
    <Grid item xs={12}>
      <Button
        color="primary"
        variant="contained"
        className={classes.act}
        fullWidth
        onClick={props.handleClick}
        size="large"
        disabled={
          formState.isSubmitting || config.component.register?.disabled === true
        }
        endIcon={
          <SvgIcon>
            <ProcaIcon />
          </SvgIcon>
        }
      >
        {" "}
        {props.buttonText ||
          t(config.component.register?.button || "action.register")}
      </Button>
    </Grid>
  );
};

export default function Register(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const [data, setData] = useData();
  const [beforeSubmit, _setBeforeSubmit] = useState(null);
  const customField = React.useRef({});
  const setBeforeSubmit = fct => {
    if (!beforeSubmit) {
      _setBeforeSubmit(() => fct); // you can't put a function or promise in useState directly, it's taken as a setter instead
    }
  };
  let emailProvider = useRef(undefined); // we don't know the email provider
  const { t } = useTranslation();

  if (props.emailProvider) emailProvider = props.emailProvider; // use case: if Register is called from a parent component that wants to store the email provider

  const compact = useCompactLayout("#proca-register", 380);
  let buttonNext = "Next";

  const [status, setStatus] = useState("default");
  const _form = useForm({
    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: props.form ? null : data,
  });

  const form = props.form || _form;
  const { trigger, handleSubmit, setError, getValues, setValue } = form;

  const comment = data.comment;
  useEffect(() => {
    setValue("comment", comment);
  }, [comment, setValue]);

  const onSubmit = async formData => {
    config.data &&
      Object.entries(config.data).forEach(([key, value]) => {
        if (!formData[key]) formData[key] = value;
      });

    if (emailProvider.current === false) {
      setError("email", {
        type: "mx",
        message: t("email.invalid_domain", {
          defaultValue: "{{domain}} cannot receive emails",
          domain: getDomain(formData.email),
        }),
      });
      // the email domain is checked and invalid
      return false;
    } else {
      if (emailProvider.current) formData.emailProvider = emailProvider.current;
    }

    formData.tracking = Url.utm(config.component.register?.tracking);

    if (config.component.consent?.implicit) {
      formData.privacy =
        config.component.consent.implicit === true
          ? null
          : config.component.consent.implicit;
      // implicit true or opt-in or opt-out
    }
    let actionType = config.component.register?.actionType || "register";
    if (props.targets) {

      formData.targets = props.targets;

     if (config.test && props.targets.length > 1)  {
          formData.targets = props.targets.slice(0,1);
          console.warn ("TEST mode, sending only one test email not " + props.targets.length)
        }

      actionType = "mail2target";
    }
    if (props.beforeSubmit && typeof props.beforeSubmit === "function") {
      formData = await props.beforeSubmit(formData);
    }
    if (beforeSubmit && typeof beforeSubmit === "function") {
      formData = await beforeSubmit(formData);
    }
    if (customField.current.beforeSubmit) {
      formData = await customField.current.beforeSubmit(formData);
    }

    if (!formData) {
      console.error("missing data");
      return false;
    }

    if (isUuid()) {
      // they were previous actions, we associate them with the contact recorded now
      formData.uuid = uuid();
    }

    if (data.uuid) {
      // the contact is known, but the contact details possibly not set
      formData.uuid = data.uuid;
    }

    let result = null;
    if (data.uuid) {
      const expected =
        "uuid,firstname,lastname,email,phone,country,postcode,locality,address,region,birthdate,privacy,tracking,donation".split(
          ","
        );

      const payload = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value && !expected.includes(key)) payload[key] = value;
      }
      result = await addAction(
        config.actionPage,
        actionType,
        {
          uuid: data.uuid,
          tracking: Url.utm(config.component?.register?.tracking),
          payload: payload,
        },
        config.test
      );
    } else {
      result = await addActionContact(
        actionType,
        config.actionPage,
        formData,
        config.test
      );
    }

    if (result.errors) {
      let handled = false;
      if (result.errors.fields) {
        result.errors.fields.forEach(field => {
          if (field.name in formData) {
            setError(field.name, { type: "server", message: field.message });
            handled = true;
          } else if (field.name.toLowerCase() in formData) {
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

    if (result.addAction) {
      result = result.addAction;
    }

    dispatch(
      `${config.component?.register?.actionType || "register"}:complete`,
      {
        uuid: result.contactRef,
        test: !!config.test,
        firstname: formData.firstname,
        country: formData.country,
        comment: formData.comment,
        privacy: formData.privacy,
        email: config.component?.dispatch?.email && formData.email,
        emailProvider:
          config.component?.dispatch?.email && emailProvider.current,
      },
      formData,
      config
    );
    if (config.component.register?.remember) {
      setCookie("proca_firstname", formData.firstname);
      setCookie("proca_uuid", result.contactRef);
    }
    setStatus("success");
    setData(formData);
    if (!config.component.share?.anonymous) {
      uuid(result.contactRef); // set the global uuid as signature's fingerprint
    }
    props.done &&
      props.done({
        errors: result.errors,
        uuid: uuid(),
        firstname: formData.firstname,
        country: formData.country,
        privacy: formData.privacy,
        comment: formData.comment,
      });
  };

  const handleClick = async () => {
    const result = await trigger();
    if (result) {
      if (props.onClick) {
        // do not await it, it would open a warning 'firefox prevented this page to open a pop up window...
        setTimeout(() => handleSubmit(onSubmit)(), 1);

        props.onClick(getValues()); // how to get the data updated?
      } else {
        await handleSubmit(onSubmit)();
      }
    }
  };

  /*
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
*/

  function ErrorS(props) {
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

  let ConsentBlock = config.component.consent?.implicit
    ? ImplicitConsent
    : Consent;

  if (config.component.consent?.buttons) {
    ConsentBlock = function NoConsent() {
      return null;
    };
  }

  const isValid = Object.keys(form.formState.errors).length === 0;
  const classField = data.uuid && isValid ? classes.hidden : classes.field;
  //const classField = classes.field;
  const enforceRequired = !data.uuid; // if the user took action, no fields are required

  if (typeof props.buttonNext === "string") {
    buttonNext = props.buttonNext;
  }
  const next = () => {
    const d = getValues();
    setData(d);
    dispatch(
      `${config.component?.register?.actionType || "register"}:skip`,
      {
        test: !!config.test,
        country: d.country,
      },
      d,
      config
    );
    props.done();
  };

  return (
    <form
      className={classes.container}
      id="proca-register"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      action="http://localhost"
    >
      <Success display={status === "success"} />
      <ErrorS display={status === "error"} />
      <Container component="div" maxWidth="sm">
        <ConditionalDisabled
          disabled={config.component.register.disabled === true}
        >
          <WelcomeSupporter />
          <Box marginBottom={1}>
            <Grid container spacing={1}>
              {config.component.register.custom?.top && (
                <CustomField
                  compact={compact}
                  form={form}
                  position="top"
                  myref={customField}
                  handleBeforeSubmit={setBeforeSubmit}
                  classes={classes}
                />
              )}
              {config.component.register.field.organisation && (
                <Grid item xs={12} className={classField}>
                  <TextField
                    type="organisation"
                    form={form}
                    name="organisation"
                    label={t("Organisation")}
                    required={
                      enforceRequired &&
                      config.component.register.field.organisation.required
                    }
                  />
                </Grid>
              )}
              <NameField form={form} compact={compact} classField={classField} enforceRequired={enforceRequired}/>
              <EmailField form={form} required={enforceRequired} compact={compact} classField={classField}/>
              <Address form={form} compact={compact} classField={classField} />
              <PhoneField form={form} classField={classField} compact={compact} />
              {config.component.register.custom?.comment && (
                <CustomField
                  compact={compact}
                  position="comment"
                  form={form}
                  classes={classes}
                  handleBeforeSubmit={setBeforeSubmit}
                  myref={customField}
                />
              )}
              {config.component.register?.field?.comment !== false && (
                <Grid item xs={12} className={classField}>
                  <TextField
                    form={form}
                    name="comment"
                    multiline
                    maxRows="10"
                    required={
                      enforceRequired &&
                      config.component.register?.field?.comment?.required
                    }
                    label={t("Comment")}
                    helperText={t("help.comment", "")}
                  />
                </Grid>
              )}
              {props.extraFields &&
                props.extraFields({ form: form, classes: classes })}

              {config.component.register.custom?.bottom && (
                <CustomField
                  compact={compact}
                  form={form}
                  classes={classes}
                  handleBeforeSubmit={setBeforeSubmit}
                  myref={customField}
                />
              )}
              {!data.uuid && (
                <ConsentBlock
                  organisation={props.organisation}
                  privacy_url={config.privacyUrl}
                  intro={props.consentIntro}
                  form={form}
                />
              )}
              <SubmitButton
                handleClick={handleClick}
                form={form}
                buttonText={props.buttonText}
              />
              <Grid item xs={12}>
                <ConsentProcessing />
                {config.component.register?.next && (
                  <Button
                    endIcon={<SkipNextIcon />}
                    className={classes.next}
                    variant="contained"
                    onClick={next}
                  >
                    {t([buttonNext])}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </ConditionalDisabled>
      </Container>
    </form>
  );
}
