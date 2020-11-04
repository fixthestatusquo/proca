import i18n from '../../lib/i18n';
import React,{useState, useEffect} from 'react';
import { useTranslation } from "react-i18next";
import useForm from "react-hook-form";

import eciLocale from '../../locales/en/eci';
import Country from './Country';
import General from './General';
import useElementWidth from "../../hooks/useElementWidth";
import useData from "../../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";

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
const countries = eciLocale.common.country;

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  }     
}));

export default (props) => {
  const classes = useStyles();

  const width = useElementWidth("#proca-register");
  const [compact, setCompact] = useState(true);

  const { t } = useTranslation();
//  const config = useCampaignConfig();
  const [data, setData] = useData();


  const form = useForm({
    defaultValues: data
  });

  const {
    handleSubmit,
    setError,
    formState
  } = form;

  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const onSubmit = async data => {
    console.log(data);
//    data.tracking = Url.utm();
    return false;
  }

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
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
  }, [setError]);

  return <form
      className={classes.container}
      id="proca-register"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
  >
    <Country form={form} countries={eciLocale.common.country} />
    <General form={form} compact={compact} />
    </form>;
}
