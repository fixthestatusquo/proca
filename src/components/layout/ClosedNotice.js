import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useCampaignConfig } from "@hooks/useConfig";
import useCount from "@hooks/useCount";
import { formatNumber } from "@components/ProgressCounter";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
  "@global": {
    "#proca-ribbon": {
      display: "block",
      opacity: 1,
      transition: "all .5s",
    },
    ".proca-progress": {
      display: "none",
    },
  },
  root: {
    top: 100,
    right: 0,
    width: 800,
    position: "fixed",
    zIndex: 70000,
  },
  widget: {
    margin: "10px",
  },
  box: {
    opacity: 0.8,
    padding: "10px",
    color: "white",
    backgroundColor: theme.palette.primary.main,
  },
  ribbon: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    width: 850,
    textAlign: "center",
    padding: "10px 200px",
    zIndex: 10000,
    "&::before": {
      position: "absolute",
      zIndex: -1,
      content: "",
      display: "block",
      border: "5px solid #2980b9",
    },
    "&::after": {
      position: "absolute",
      zIndex: -1,
      content: "",
      display: "block",
      border: "5px solid #2980b9",
    },
    transform: "translateX(180px) rotate(35deg)",
    top: 60,
    marginLeft: -40,
  },
}));

const elem = document.createElement("div");
elem.id = "proca-ribbon";
document.body.prepend(elem);

const Closed = () => {
  const config = useCampaignConfig();
  const count = useCount(config.actionPage);
  const classes = useStyles();

  useEffect(() => {
    document.addEventListener("mousedown", () => {
      const ribbon = document.getElementById("proca-ribbon");
      window.setTimeout(() => (ribbon.style.display = "none"), 500);
    });

    if (config.component.notice?.widget === true) {
      // not sure if used still
      const ribbon = document.getElementById("ribbon");
      const widget = document.getElementsByClassName("proca-widget")[0];

      widget.before(ribbon);
    }
  }, []);

  let root = classes.root;
  let box = classes.ribbon;
  if (config.component.notice?.widget === true) {
    root = classes.widget;
    box = classes.box;
  }
  if (config.component.widget?.closed !== true) return null;
  return ReactDOM.createPortal(
    <div className={root}>
      <Box className={box} boxShadow={3}>
        <h3>{formatNumber(count)}</h3>
        <span className={classes.span}>
          Thank you - Благодаря ти - Hvala vam - Děkujib – Tack – Bedankt –
          Aitäh – Kiitos – Merci – Danke – ευχαριστώ – Kösz – Grazie – Paldies -
          Dziękuję Ci – Obrigado – Mulțumesc – Ďakujem - Hvala vam – Gracias
        </span>
      </Box>
    </div>,
    elem
  );

  //  return (<Alert icon={<ThumbUpIcon fontSize="inherit" />} severity="success" autoHideDuration={null} title={formatNumber(count)}>Thank you - Благодаря ти - Hvala vam - Děkujib – Tack – Bedankt – Aitäh – Kiitos – Merci – Danke – ευχαριστώ – Kösz – Grazie – Paldies - Dziękuję Ci – Obrigado – Mulțumesc – Ďakujem - Hvala vam – Gracias</Alert>);
};

export default Closed;
