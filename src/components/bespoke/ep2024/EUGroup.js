import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
const useStyles = makeStyles(theme => ({
  root: {
    display: "inline",
    paddingRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  label: {
    padding: theme.spacing(0),
  },
}));

const colorGroup = name => {
  const eu_groups = {
    "GUE/NGL": "#800c00",
    "S&D": "#c21200",
    "Greens/EFA": "#05a61e",
    Renew: "#ffc200",
    ECR: "#3086c2",
    EPP: "#0a3e63",
    ESN: "#808080",
    Patriots: "#9b20a9",
    PfE: "#9b20a9",
  };
  return eu_groups[name] || "#E0E0E0";
};

const EUGroup = props => {
  const theme = useTheme();

  const classes = useStyles();
  const color = colorGroup(props.name);
  return (
    <Chip
      size="small"
      style={{
        backgroundColor: color,
        color: theme.palette.getContrastText(color),
      }}
      classes={{ root: classes.root, label: classes.label }}
      label={props.name}
    />
  );
};

export default EUGroup;
