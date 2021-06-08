import { useData } from "../../../hooks/useData";
import useLayout from "../../../hooks/useLayout";
import React from "react";
import { Button, withStyles } from "@material-ui/core";

const StyledButton = withStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
  },
  disabled: {},
}))(Button);

const FrequencyButton = (props) => {
  const layout = useLayout();
  const [data, setData] = useData();

  const handleFrequency = (i) => {
    setData("frequency", i);
  };
  const frequency = data.frequency;

  return (
    <StyledButton
      onClick={() => handleFrequency(props.frequency)}
      color={frequency === props.frequency ? "secondary" : "default"}
      variant={frequency === props.frequency ? "contained" : "outlined"}
      disableElevation={props.frequency === frequency}
      value={props.frequency}
      classes={props.classes}
    >
      {props.children}
    </StyledButton>
  );
};

export default FrequencyButton;
