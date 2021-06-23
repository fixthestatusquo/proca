import { useData } from "../../../hooks/useData";
import React from "react";
import { Button, Grid, withStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const StyledButton = withStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
  },
  disabled: {},
}))(Button);

const FrequencyButton = (props) => {
  const [data, setData] = useData();

  const handleFrequency = (i) => {
    setData("frequency", i);
  };

  const value = props.buttonValue;
  const selected = props.selected;

  // todo: offer this as an option? color={frequency === props.frequency ? "secondary" : "default"}
  return (
    <StyledButton
      color="secondary"
      onClick={() => handleFrequency(value)}
      variant={selected === value ? "contained" : "outlined"}
      disableElevation={selected === value}
      value={value}
      classes={props.classes}
    >
      {props.children}
    </StyledButton>
  );
};

const FrequencyButtons = ({ frequencies, selected, classes }) => {
  const { t } = useTranslation();

  // if the widget is configured for only one frequency, we don't show any buttons
  // and data.frequency will already be set. See initDataState...

  if (frequencies.length === 0) {
    return null;
  }
  return (
    <div className={classes.frequency}>
      <Grid container spacing={1}>
        {frequencies.map((f) => (
          <Grid key={f} item sm={12} md={6}>
            <FrequencyButton buttonValue={f} selected={selected}>
              {t(f.toUpperCase())}
            </FrequencyButton>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default FrequencyButtons;
