import React from "react";
import TextField from "@components/field/TextField";
import { useComponentConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import SvgIcon from "@material-ui/core/SvgIcon";
import WebIcon from "@mui/icons-material/Home";

const Organisation = ({ form, classField, enforceRequired }) => {
  const component = useComponentConfig();
  const { setValue, getValues, setError, watch, register } = form;
  const organisation = component.register.field.organisation;
  const array = watch(["organisation", "logo", "description", "url"]);
  const field = {
    organisation: array[0],
    logo: array[1],
    description: array[2],
    url: array[3],
  };

  const handleBlur = e => {
    form.handleBlur && form.handleBlur(e);
    console.log("fetching");
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
        form={form}
        onBlur={handleBlur}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {field.twitter ? (
                <IconButton
                  aria-label="Fetch organisation details"
                  onClick={handleClick}
                  onMouseDown={handleMouseDown}
                >
                  <SearchIcon />
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
        name="organisation"
        label={t("Organisation")}
        required={enforceRequired && organisation?.required}
      />
    </Grid>
  );
};

export default Organisation;
