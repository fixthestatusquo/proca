import React, { useState } from "react";
import TextField from "@components/field/TextField";
import { useComponentConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import { Grid, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import SvgIcon from "@material-ui/core/SvgIcon";
import WebIcon from "@material-ui/icons/Link";
import CircularProgress from "@material-ui/core/CircularProgress";

const Organisation = ({ form, classField, enforceRequired }) => {
  const component = useComponentConfig();
  const [loading, setLoading] = useState(false);
  const { setValue, getValues, setError, watch } = form;
  const organisation = component.register.field.organisation;
  const array = watch(["organisation", "logo", "description", "url"]);
  const field = {
    organisation: array[0],
    logo: array[1],
    description: array[2],
    url: array[3],
  };
  let error = form.formState.errors?.url;

  const fetchMeta = async (url, retry) => {
    if (!url) {
      return;
    }
    error = form.formState.errors?.url;

    if (error) {
      if (!/^https?:\/\//i.test(url)) {
        setValue("url", `https://${url}`, { shouldValidate: true });
        form.clearErrors("url");
        //await form.trigger("url");
        if (!retry) fetchMeta(`https://${url}`, true);
      }
      return;
    }
    const api = `https://metapi.proca.app?url=${url}`;
    async function fetchAPI() {
      const field = "url";
      setLoading(true);
      await fetch(api)
        .then(res => {
          setLoading(false);
          if (!res.ok) {
            setError(field, {
              type: "metapi_error",
              message: "can't load the site",
            });
            error = form.formState.errors?.url;
            console.log(res, error);
          }
          return res.json();
        })
        .then(res => {
          setLoading(false);
          if (res && res.error) {
            setError(field, {
              type: "metapi_error",
              message: "Can't load the site. " + res.error,
            });
            return;
          }
          res.name = res.name
            .replace(
              /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
              ""
            ) // no emoji
            .replace(/#\w\w+\s?/g, ""); // no hashtag
          setValue("organisation", res.name);
          if (res.url) {
            form.clearErrors("url");
            setValue(field, res.url);
            const domain = new URL(res.url).hostname;
            domain && setValue("email", `@${domain.replace("www.", "")}`);
          }

          setValue("organisation", res.name);
          setTimeout(() => {
            console.log("timeout");
            form.setFocus("organisation");
          }, 1000);
          setValue("logo", res.logo);
          setValue("comment", res.description);
        })
        .catch(err => {
          console.log(err);
        });
    }

    fetchAPI();
  };
  const handleClick = () => {
    console.log("click", getValues("url"));
    fetchMeta(getValues("url"));
  };

  const handleBlur = e => {
    form.handleBlur && form.handleBlur(e);
    fetchMeta(getValues("url"));
  };

  const handleMouseDown = event => {
    event.preventDefault();
  };

  const { t } = useTranslation();
  return (
    <Grid item xs={12} className={classField}>
      <TextField
        name="url"
        type="url"
        label={t("url")}
        placeholder="https://"
        form={form}
        onBlur={handleBlur}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {field.url ? (
                <IconButton
                  aria-label="Fetch organisation details"
                  onClick={handleClick}
                  onMouseDown={handleMouseDown}
                >
                  {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                </IconButton>
              ) : (
                <SvgIcon>
                  <WebIcon />
                </SvgIcon>
              )}
            </InputAdornment>
          ),
        }}
        required={enforceRequired && organisation?.required}
      />
      <TextField
        type="organisation"
        form={form}
        hidden={!field.organisation}
        name="organisation"
        label={t("Organisation")}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {field.logo ? (
                <SvgIcon fontSize="large">
                  <image href={field.logo} width={24} height={24} />
                </SvgIcon>
              ) : (
                ""
              )}
            </InputAdornment>
          ),
        }}
        required={enforceRequired && organisation?.required}
      />
    </Grid>
  );
};

export default Organisation;
