import React, { useLayoutEffect, useRef } from "react";
//import useCount from "@hooks/useCount.js";
import { CountUp } from "countup.js";
import { useCampaignConfig } from "@hooks/useConfig.js";
import { Typography, Card, CardHeader, CardContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

function getThousandsSeparator(locale = navigator.language) {
  if (locale.substr(0, 2) !== "de") return "\u00A0";

  const numberFormat = new Intl.NumberFormat(locale);
  const parts = numberFormat.formatToParts(1234567);
  const groupPart = parts.find(part => part.type === "group");
  return groupPart ? groupPart.value : "\u202F";
}

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(1),
    "& .proca-MuiCardContent-root": {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(0),
    },
    "& .proca-MuiCardHeader-root": {
      fontSize: "2rem",
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(0),
      color: theme.palette.primary.contrastText,
      fontWeight: "bold",
      textAlign: "center",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
      "&:hover": {
        transform: "translateY(-2px)",
      },
    },
    "& .proca-MuiCardHeader-subheader": {
      color: "#666",
      fontStyle: "italic",
    },
  },
}));

export default function Counter(props) {
  const { component } = useCampaignConfig();
  const classes = useStyles();
  const countUpRef = useRef(null);
  const countup = useRef(null);
  const step = component.counter?.step || 1;
  const from = new Date(component.counter.start);
  const counter = (now = new Date()) =>
    Math.floor(((now - from) / 1000) * step);

  useLayoutEffect(() => {
    if (!countup.current) return;
    console.log("init", countup.current, countUpRef.current);
    initCountUp();
    setInterval(() => {
      countUpRef.current?.update(counter());
    }, 2000);
  }, [component.counter]);

  async function initCountUp() {
    countUpRef.current = new CountUp(countup.current, counter(), {
      enableScrollSpy: true,
      duration: 1.5,
      useEasing: true,
      separator: getThousandsSeparator(),
    });
    if (!countUpRef.current.error) {
      countUpRef.current.start();
    } else {
      console.error(countUpRef.current.error);
    }
  }

  //  const count = useCount(props.actionPage) || props.count;
  if (component?.counter.card) {
    return (
      <Card className={classes.container}>
        <CardHeader ref={countup}></CardHeader>
        <CardContent>{props.children}</CardContent>
      </Card>
    );
  }
  return <span ref={countup}>?</span>;
}
