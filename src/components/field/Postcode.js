import React, { useEffect } from "react";

import { Grid, InputAdornment, IconButton } from "@material-ui/core";

import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import HiddenField from "@components/field/Hidden";
import SearchIcon from "@material-ui/icons/Search";

const Postcode = (props) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();

  const { t } = useTranslation();

  const compact = props.compact;
  const { setValue, watch, getValues } = props.form;
  const classField = props.classField;
  const [postcode, country] = watch(["postcode", "country"]);
  const postcodeLength = {
    US: 5,
    AT: 4,
    BE: 4,
    CH: 4,
    DE: 5,
    FR: 5,
    IT: 5,
    PL: 5,
    CA: 5,
    DK: 4,
    NL: 4,
  };

  const geocountries = props.geocountries || Object.keys(postcodeLength);

  useEffect(() => {
    if (!geocountries.includes(country)) {
      return;
    }
    if (!postcode || postcode.length !== postcodeLength[country]) {
      const [area, constituency, locality] = getValues([
        "area",
        "constituency",
        "locality",
      ]);
      if (area) setValue("area", "");
      if (locality) setValue("locality", "");
      if (constituency) setValue("constituency", "");
      return;
    }
    const api = "https://" + country + ".proca.app/" + postcode;

    async function fetchAPI() {
      await fetch(api)
        .then((res) => {
          if (!res.ok) {
            setValue("locality", "");
            setValue("area", "");
            setValue("constituency", "");

            if (props.search) {
              props.form.setError("postcode", {
                type: "not found",
                message: t("postcode.notFound"),
              });
            }
            throw Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res && res.name) {
            setValue("locality", res.name);
            setValue("constituency", "");
            setValue("area", "");
          }
          if (res && res.area) {
            setValue("area", res.area);
            setValue("constituency", "");
          }
          if (res && res.constituency) {
            setValue("constituency", res.constituency);
          }
        })
        .catch((err) => {
          // for now, let's not flag as an error if we don't find the postcode
          console.log(err.toString());
          /* setError("postcode", {
            type: "network",
            message: (err && err.toString()) || "Network error",
          }); */
        });
    }
    fetchAPI();
    // eslint-disable-next-line
  }, [postcode, country, setValue, getValues]);

  const handleSearch = async () => {
    if (!postcode) {
      props.form.setError("postcode", {
        type: "empty",
        message: t("required"),
      });
      return;
    }
    if (postcode.length !== postcodeLength[country]) {
      props.form.setError("postcode", {
        type: "wrong length",
        message: t("postcode.wrongLength", {
          defaultValue: "expected length of {{length}} for your country",
          length: postcodeLength[country],
        }),
      });
    }
    // if the right length, the lookup if performed automatially already by the useEffect above
    /*
    const postcode = props.form.getValues("postcode");
    const api = "https://" + props.country + ".proca.app/" + postcode;
    if (props.constituency) return;
    const setValue = props.form.setValue;
    const fetchAPI = async () => {
      await fetch(api)
        .then((res) => {

          if (!res.ok) {
            setValue("locality", "");
            setValue("area", "");
            setValue("constituency", "");

            props.form.setError("postcode", {
              type: "network",
              message:
                res.status === 404
                  ? t("unknown postcode")
                  : res.statusText || "Network error",
            });
          }
          return res.json();
        })
        .then(() => {
          console.warn("should be handled into the address");
        })
        .catch((err) => {
          props.form.setError("postcode", {
            type: "network",
            message: (err && err.toString()) || "Network error",
          });
        });
    };
    fetchAPI(postcode);
*/
  };

  return (
    <>
      <Grid
        item
        xs={12}
        sm={props.width || compact ? 12 : 3}
        className={classField}
      >
        <TextField
          form={props.form}
          name="postcode"
          autoComplete="postal-code"
          label={t("Postal Code")}
          customValidity={props.customValidity}
          required={config.component.register?.field?.postcode?.required}
          InputProps={{
            endAdornment: props.search && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Fetch postcode details"
                  onClick={handleSearch}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </>
  );
};

export default Postcode;
