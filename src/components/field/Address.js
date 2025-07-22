import React from "react";

import { Grid } from "@material-ui/core";
import TextField from "@components/field/TextField";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import Country from "@components/field/Country";
import Postcode from "@components/field/Postcode";
import HiddenField from "@components/field/Hidden";
import PlaceIcon from '@material-ui/icons/Place';
import { InputAdornment } from "@material-ui/core";

const Address = props => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();

  const { t } = useTranslation();

  const compact = props.compact;
  const classField = props.classField;
  // xor postcode + locality?
  const hasPostcode = config.component.register?.field?.postcode !== false;
  const hasLocality = config.component.register?.field?.locality;

  const minWidthCountry = hasPostcode && !hasLocality ? 9 : 12;

  return (
    <>
      {config.component.register?.field?.street && (
        <Grid item xs={12} className={classField}>
          <TextField form={props.form} name="street" label={t("Street")} />
        </Grid>
      )}
      {hasPostcode && <Postcode form={props.form} compact={compact} />}
      {hasLocality && (
        <Grid item xs={12} sm={compact ? 12 : 9} className={classField}>
          <TextField
            form={props.form}
            name="locality"
            label={t("City")}
            required={config.component.register?.field?.locality?.required}
            customValidity={props.customValidity}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
                <PlaceIcon
                  color={
                    props.form.getFieldState("postcode").invalid ? "error" : "action"
                  }
/>
            </InputAdornment>
          ),
        }}
          />
        </Grid>
      )}
      {config.component.register?.field?.country === false &&
        config.component.country && (
          <HiddenField
            form={props.form}
            name="country"
            value={config.component.country}
          />
        )}
      {config.component.register?.field?.country !== false && (
        <Grid
          item
          xs={12}
          sm={compact ? 12 : minWidthCountry}
          className={classField}
        >
          <Country form={props.form} required />
        </Grid>
      )}
    </>
  );
};

export default Address;
