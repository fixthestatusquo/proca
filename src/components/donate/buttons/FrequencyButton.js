import { useData } from "../../../hooks/useData";
import React from "react";
import { Button, Grid, Typography, withStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "../../../hooks/useConfig";
import { makeStyles } from "@material-ui/styles";

const StyledButton = withStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
  },
  disabled: {},
}))(Button);

const FrequencyButton = ({ buttonValue, selected, classes, children }) => {
  const [, setData] = useData();

  const handleFrequency = i => {
    setData("frequency", i);
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
      {frequencies.map(f => (
        <Grid key={f} item xs={12} md={6}>
          <FrequencyButton
            buttonValue={f}
            selected={selected}
            setFrequency={setFrequency}
          >
            {
              /* i18next-extract-disable-next-line */
              t(`donation.frequency.each.${f.toLowerCase()}`, {
                defaultValue: f,
              })
            }
          </FrequencyButton>
        </Grid>
      ))}
    </Grid>
  );
};

const Frequencies = props => {
  const { t } = useTranslation();

  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const frequencies = donateConfig?.frequency?.options || ["oneoff"];

  const [data] = useData();
  const frequency =
    data.frequency ||
    config.component.donation?.frequency?.default ||
    "default";

  return frequencies.length > 1 ? (
    <>
      {" "}
      <Typography variant="h6" paragraph gutterBottom color="textPrimary">
        {
          /*  i18next-extract-disable-next-line */
          t(`donation.frequency.ask.${frequency.toLowerCase()}`, {
            defaultValue: "Make it monthly?",
          })
        }
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
