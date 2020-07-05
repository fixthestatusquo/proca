import React, { Fragment } from "react";
import {
  Box,
  Grid,
  Radio,
  FormHelperText,
  FormControlLabel,
  RadioGroup,
  Collapse,
} from "@material-ui/core";
import {Alert,AlertTitle} from '@material-ui/lab';

import { useTranslation,Trans } from "react-i18next";

export default props => {
  const errors = props.errors;
  const options = props.options;
  const classes = props.classes;
  const register = props.register;
  const { t } = useTranslation();
  const [value, setValue] = React.useState(false);

  const handleChange = event => {
    setValue(event.target.value);
  };

  return (
    <Fragment>
      <Grid item xs={12}>
        <FormHelperText
          className={classes.bigHelper}
          error={errors.privacy}
          variant={options.variant}
          margin={options.margin}
        >
          {t("consent.intro", { name: props.organisation })} *
        </FormHelperText>
      </Grid>
      <Grid item xs={12}>
        <RadioGroup aria-label="privacy consent" name="privacy" onChange={handleChange} required>
          <FormControlLabel
            value="opt-in"
            inputRef={register}
            control={<Radio color="primary" />}
            label={t("consent.opt-in")}
          />

          <FormControlLabel
            value="opt-out"
            control={<Radio />}
            
            inputRef={register({ required: "Yes or No?" })}
            label={t("consent.opt-out")}
          />
<Collapse in={value === "opt-out"}>
    <Alert severity="warning">
    <Trans i18nKey="consent.confirm"> 
      <AlertTitle>Sure?</AlertTitle><span>explanation</span><b>unsubscribe at any time</b>
    </Trans></Alert>
    </Collapse>
        </RadioGroup>
      </Grid>
      <Grid item xs={12}>
        <Box className={classes.notice}>
          {t("consent.processing", {
            privacy_url: "https://proca.foundation/privacy"
          })}
        </Box>
      </Grid>
    </Fragment>
  );
};
