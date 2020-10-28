import React, { Fragment } from "react";
import {
  Box,
  Grid,
  Radio,
  RadioGroup,
  FormHelperText,
  FormControlLabel,
  Collapse
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "../hooks/useConfig";
import {useLayout} from "../hooks/useLayout";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  bigHelper: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
    fontSize: theme.typography.pxToRem(16),
    width: "100%",
    color: theme.palette.text.primary,
    padding: "4px",
    lineHeight: "1.3em"
  },
  label: {
    fontSize:theme.typography.pxToRem(13),
    color: theme.palette.text.primary,
    marginBottom:theme.spacing(0)
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

export default props => {
  const {errors, register} = props.form;
  const { t } = useTranslation();
  const [value, setValue] = React.useState(false);
  const config=useCampaignConfig();
  const layout = useLayout();
  const classes = useStyles();
 
  const handleChange = event => {
    setValue(event.target.value);
  };

  const link = config.component?.consent.privacyPolicy || "https://proca.foundation/privacy_policy";
  return (
    <Fragment>
      <Grid item xs={12}>
        <FormHelperText
          className={classes.bigHelper}
          error={errors.privacy}
          variant={layout.variant}
          margin={layout.margin}
        >
          {t("consent.intro", { name: config.organisation })} *
        </FormHelperText>
      </Grid>
      <Grid item xs={12}>
        <RadioGroup
          aria-label="privacy consent"
          name="privacy"
          onChange={handleChange}
          required
        >
          <FormControlLabel
            value="opt-in"
            inputRef={register}
            className ={classes.label}
            control={<Radio color="primary" />}
            label={t("consent.opt-in")}
          />

          <FormControlLabel
            value="opt-out"
            control={<Radio />}
            className ={classes.label}
            inputRef={register({ required: "Yes or No?" })}
            label={t("consent.opt-out")}
          />
          <Collapse in={value === "opt-out"}>
            <Alert severity="warning">
              <Trans i18nKey="consent.confirm">
                <AlertTitle>Sure?</AlertTitle>
                <span>explanation</span>
                <b>unsubscribe at any time</b>
              </Trans>
            </Alert>
          </Collapse>
        </RadioGroup>
      </Grid>
      <Grid item xs={12}>
        <Box className={classes.notice}>
          <Trans i18nKey="consent.processing">
            Text <a href={link}>link</a>
          </Trans>
        </Box>
      </Grid>
    </Fragment>
  );
};
