import { useData } from "../../../hooks/useData";
import React from "react";
import { Button, Grid, Typography, withStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "../../../hooks/useConfig";
import { makeStyles } from "@material-ui/styles";
import { DISPATCH_ACTION, usePayPalScriptReducer } from "@paypal/react-paypal-js";

const StyledButton = withStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
  },
  disabled: {},
}))(Button);

const setPayPalFrequency = (frequency, options, dispatch) => {
  let changed = false;

  // anything but oneoff is a subscription
  if (frequency !== "oneoff" && options.intent !== "subscription") {
    changed = true;
    options.intent = "subscription";
    options.vault = "true";

    // oneoff should never have intent
  } else if (frequency === "oneoff" && options.intent !== "") {
    changed = true;
    options.intent = "";
    options.value = "";
  } else {
    // noop - we're already in sync
  }

  if (changed) {
    dispatch({
      type: DISPATCH_ACTION.RESET_OPTIONS,
      value: options,
    });
  }
  return frequency;
};



const FrequencyButton = ({ buttonValue, selected, classes, children }) => {
  const [, setData] = useData();
  const [{ options }, dispatch] = usePayPalScriptReducer();

  const handleFrequency = (i) => {
    setData("frequency", i);
    setPayPalFrequency(i, options, dispatch);
  };

  const value = buttonValue;

  // todo: offer this as an option? color={frequency === props.frequency ? "secondary" : "default"}
  return (
    <StyledButton
      color="secondary"
      onClick={() => handleFrequency(value)}
      variant={selected === value ? "contained" : "outlined"}
      disableElevation={selected === value}
      value={value}
      fullWidth={true}
      classes={classes}
    >
      {children}
    </StyledButton>
  );
};

const useStyles = makeStyles(() => ({
  formContainers: {
    marginBottom: "1em",
  },
}));

const FrequencyButtons = ({ frequencies, selected, setFrequency }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  // if the widget is configured for only one frequency, we don't show any buttons
  // and data.frequency will already be set

  if (frequencies.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={1} className={classes.formContainers}>
      {frequencies.map((f) => (
        <Grid key={f} item xs={12} md={6}>
          <FrequencyButton
            buttonValue={f}
            selected={selected}
            setFrequency={setFrequency}
          >
            {
              /* i18next-extract-disable-next-line */
              t("donation.frequency.each." + f.toLowerCase(), { defaultValue: f })}
          </FrequencyButton>
        </Grid>
      ))}
    </Grid>
  );
};

const Frequencies = (props) => {
  const { t } = useTranslation();

  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const frequencies = donateConfig?.frequency?.options || ["oneoff", "monthly"];

  const [data] = useData();
  const frequency = data.frequency;

  return frequencies.length > 1 ? (
    <>
      {" "}
      <Typography variant="h6" paragraph gutterBottom color="textPrimary">
        {
          /*  i18next-extract-disable-next-line */
          t("donation.frequency.ask." + frequency.toLowerCase(), {
            defaultValue: "Make it monthly?",
          })}
      </Typography>
      <FrequencyButtons
        frequencies={frequencies}
        selected={frequency}
        setFrequency={props.setFrequency}
      />
    </>
  ) : null;
};

export default Frequencies;
