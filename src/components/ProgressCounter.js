import React, { useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { LinearProgress, Box } from "@material-ui/core";
import useCount from "@hooks/useCount";
//3,014,823 have signed. Let’s get to 4,500,000!
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

const useStyles = makeStyles(theme => ({
  "@global": {},
  "@keyframes procaPrimaryGrey": {
    "0%": {
      color: theme.palette.text.primary,
    },
    "100%": {
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
      500000, 1000000, 1200000, 1500000, 2000000, 5000000,
    ];
  }
  let next = 1;
  steps.some(step => {
    if (value < step) {
      next = step;
      return true;
    }
    return false;
  });

  return next;
};

const normalise = (value, max) => {
  return value ? (value * 100) / max : 50;
};

export const formatNumber = (value, separator) => {
  if (typeof Intl.NumberFormat === "function" && !separator)
    return Intl.NumberFormat().format(value);
  if (!separator)
    // fallback to space
    separator = "\u00A0";
  return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${separator}`);
};

export default function Progress(props) {
  const { t, i18n } = useTranslation();
  let count = props.count;
  count = useCount(props.actionPage) || props.count;
  const config = useCampaignConfig();
  const classes = useStyles();
  const goal = nextStep(count, config.component.counter?.steps);
  const separator = config.component.counter?.separator | " "; //non breaking space
  const min = config.component.counter?.min | 0;

  const [progress, setProgress] = React.useState(1);

  useEffect(() => {
    const aim = normalise(count, goal);
    const timer = setInterval(() => {
      setProgress(prevProgress =>
        prevProgress >= aim - 10 ? aim : prevProgress + 10
      );
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, [count, goal]);

  if (config.component.counter?.disabled === true) return null;
  if (!config.test ) {
    if (!count || count <= min) {
      return <Box mt={1}>&nbsp;</Box>;
    }
  } else {
    count = count || 0;
  }

  // we are checking if the progress key matching button.action exists, if not, we use the default progress.sign
  const actionName = config.component.register.actionType || config.component.register?.button?.split(".")[1] || "sign";
  return (
    <>
      <Box className={`${classes.root} proca-progress`}>
        {t([`progress.${actionName}`,"progress.sign","progress"], {
          count: formatNumber(count, separator),
          total: formatNumber(count, separator),
          goal: formatNumber(goal, separator),
        })}
        <LinearProgress variant="determinate" value={progress} />
      </Box>
    </>
  );
}
