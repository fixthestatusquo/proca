import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { LinearProgress, Box } from "@material-ui/core";
import useCount from "@hooks/useCount.js";
//3,014,823 have signed. Let’s get to 4,500,000!
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

const useStyles = makeStyles((theme) => ({
  '@global': {
  },
  '@keyframes procaPrimaryGrey': {
    '0%': {
      color:  theme.palette.text.primary,
    },
    '100%': {
      color: theme.palette.primary.main,
    },
  },
  root: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: "bold",
    animation: `$procaPrimaryGrey 3s ${theme.transitions.easing.easeOut}`,
    color: theme.palette.text.secondary,
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

const nextStep = (value, steps) => {
  if (!steps) {
    steps = [
      100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000,
      500000, 1000000, 1200000, 150000, 2000000, 5000000, 1000000,
    ];
  }
  let next = false;

  steps.some((step, i) => {
    if (value < step) {
      next = step;
      return true;
    }
    return false;
  });
  return next;
};

const normalise = (value, max) => {
  return (value * 100) / max;
};

export const formatNumber = (value, separator) => {
  if (typeof Intl.NumberFormat === "function" && !separator)
    return Intl.NumberFormat().format(value);
  if (!separator)
    // fallback to space
    separator = "\u00A0";
  return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + separator);
};

export default function Progress(props) {
  const { t } = useTranslation();
  let count = props.count;
  count = useCount(props.actionPage) || props.count;
  const config = useCampaignConfig();
  const classes = useStyles();
  const goal = nextStep(count, config.component.counter?.steps);
  const separator = config.component.counter?.separator | " "; //non breaking space
  const min = config.component.counter?.min | 0;
  if (!count || count <= min) return null;

  const progress = count > 1 && t("progress_plural") !== "progress_plural" ? "progress_plural" : "progress";

  return (
    <Box className={classes.root}>
      {t(`${progress}`, {
        count: formatNumber(count, separator),
        goal: formatNumber(goal, separator),
      })}
      <LinearProgress variant="determinate" value={normalise(count, goal)} />
    </Box>
  );
}
