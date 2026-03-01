import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

import { Button, Grid } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  withSubText: {
    flexDirection: "column",
  },
  subText: {
    display: "inline",
    fontSize: "0.9em",
    textTransform: "none",
  },
}));

const ConsentButtons = props => {
  const classes = useStyles();
  const { register, setValue, formState } = props.form;
  const config = useCampaignConfig();
  const { t } = useTranslation();

  const handleClick = privacy => {
    setValue("privacy", privacy);
    props.form.control._fields?.privacy?._f?.ref
      ?.closest("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  };

  return (
    <>
      <input type="hidden" {...register("privacy", { required: false })} />
      <Grid item xs={12} sm={6}>
        <Button
          variant="contained"
          classes={{ label: classes.withSubText }}
          fullWidth
          onClick={e => handleClick("opt-out")}
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
          onClick={e => handleClick("opt-in")}
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
};

export default ConsentButtons;
