import i18n from '../../lib/i18n';
import React,{useState, useEffect, useLayoutEffect} from 'react';
import { Button, Grid, Snackbar, Box } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import eciLocale from '../../locales/en/eci';
import documents from "../../data/document_number_formats.json";
import { addSupport } from "../../lib/eci/server.js";

import Country from './Country';
import General from './General';
import Address from './Address';
import Consent from './Consent';
import Id from './Id';
import Details from './Details';
import useElementWidth from "../../hooks/useElementWidth";
import useData from "../../hooks/useData";
import { useCampaignConfig } from "../../hooks/useConfig";
import Alert from "@material-ui/lab/Alert";

import { makeStyles } from "@material-ui/core/styles";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import usePortal from 'react-useportal'

//import Address from './Address';
//import Id from './Id';



const removeDotKey = (obj) => {
    Object.keys(obj).forEach(key => {

    if (typeof obj[key] === 'object') {
            removeDotKey(obj[key])
        }
    if (key.includes(".")) {
      obj[key.replace(/\./g,"_")] = obj[key];
      delete obj[key];

    }
    })
}

removeDotKey(eciLocale);
i18n.addResourceBundle ('en','eci',eciLocale);
//const countries = eciLocale.common.country;

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  notice: {
    fontSize:theme.typography.pxToRem(13),
    fontWeight: 'fontWeightLight',
    lineHeight: '1.3em',
    color: theme.palette.text.secondary,
    '& a' : {
      color: theme.palette.text.secondary
    }
  }
}));

export default (props) => {
  const classes = useStyles();

  const width = useElementWidth("#proca-register");
  const [token, setToken] = useState('dummy');
  const [compact, setCompact] = useState(true);
  const [require, setRequire] = useState(false);
  const [acceptableIds, setIds] = useState({});
  const [status, setStatus] = useState("default");

  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [data] = useData();

  const { Portal } = usePortal({
    bindTo: document && document.querySelector(".eci-more")
  })



  const form = useForm({
    defaultValues: data
  });

  const {
    handleSubmit,
    setError,
    formState,
    watch
  } = form;
 

  const nationality = watch("nationality") || "";
  useEffect (() => {
    if (nationality && nationality !== "ZZ") {
      const ids = documents[nationality.toLowerCase()];
      setIds (documents[nationality.toLowerCase()]);
      setRequire (Object.keys(ids).length ? "id" : "address");
    }
  }, [nationality]);

  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const onSubmit = async data => {
    console.log(data);
    data.tracking = {};
//    data.tracking = Url.utm();

    const result = await addSupport(
      config.actionType || "support", //todo: introduce a test action 
      config.component.eci.actionpage,
      data,
      {"captcha":token}
    );
    if (result.errors) {
      result.errors.forEach(error => {
        console.log(error);
      });
      setStatus("error");
      return;
    }

    return false;
  }

  useLayoutEffect(() => {
//  useEffect(() => {
//    const more = React.useRef(document.querySelector(".eci-more"));
//    ReactDOM.createPortal(<Details eci={config.component.eci} />,more);
//    ReactDOM.hydrate(<Details eci={details} />,document.querySelector(".eci-more"));
    const title = document.querySelectorAll(".eci-title");
    title.forEach( d => d.innerHTML = t("eci:title"));
    const desc = document.querySelectorAll(".eci-description");
    desc.forEach( d => d.innerHTML = t("eci:description"));
  },[t]);

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    console.log(inputs,nationality);
    //    register({ name: "country" });
    // todo: workaround until the feature is native react-form ?
    inputs.forEach(input => {
      input.oninvalid = e => {
        setError(
          e.target.attributes.name.nodeValue,
          e.type,
          e.target.validationMessage
        );
      };
    });
  }, [setError,nationality]);

  const handleVerificationSuccess = (token) => {
    console.log(token);
    setToken(token);
  }


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

  return <form
      className={classes.container}
      id="proca-register"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
  >
      <Error display={status === "error"} />
    <Portal><Details eci={config.component.eci} /></Portal>
    <Country form={form} countries={eciLocale.common.country} />
    <div className={classes.notice} dangerouslySetInnerHTML={{__html: t("eci:common.requirements.text",{url:"https://eur-lex.europa.eu/legal-content/en/TXT/PDF/?uri=CELEX:32019R0788"})}} />
    <General form={form} birthdate={require === "address"} compact={compact} />
    {require === "address" && <Address form={form} compact={compact} />}
    {require === "id" && <Id form={form} compact={compact} ids={acceptableIds}/>}
    <Consent form={form} />
        <HCaptcha
      sitekey="aa0f1887-8dc5-4895-a8ac-fd5537984ca3"
      onVerify={token => handleVerificationSuccess(token)}
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
              {props.buttonText || t("register")}
            </Button>
          </Grid>
<Box className={classes.notice} m={1}>
    <div>{t("eci:form.support-footer1")}</div>
    <div>{t("eci:form.support-footer2")}</div>
    <div>{t("eci:form.support-footer3")}</div>
    </Box>
    </form>
}
