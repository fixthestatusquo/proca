import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Events from "@lib/observer";
//import { unsubscribeDataLayer, dataLayerObserver } from "@lib/event";

const Observer = async (event, data) => {
  //  const config = window.proca?.get?.();
  console.log("event", event);
  if (event === "share:init") {
    proca?.set("component", "widget.fab", false);
    document
      .querySelectorAll(
        ".petitionSidebar__imageWrapper, .section--petitionSidebar, .petitionWidget__header"
      )
      .forEach(el => {
        el.style.display = "none";
      });

    document.querySelectorAll(".petitionSidebar__content").forEach(el => {
      el.style.display = "block";
      console.log("el", el);
    });
    document.querySelectorAll(".petitionSidebar__sidebar").forEach(el => {
      el.style.marginTop = "auto";
      el.style.width = "auto";
      el.style.maxWidth = "none";
      el.style.position = "initial";
    });
  }
};
console.log("observer");
Events.subscribe(Observer);

const useGlobalStyles = makeStyles(theme => ({
  "@global": {
    ".count": { display: "flex" },
    ".proca-progress *": {
      fontSize: "1em!important",
      fontWeight: "normal!important",
    },

    ".goal": {
      paddingBottom: theme.spacing(1),
      marginLeft: "auto",
      paddingRight: "8px",
      borderRight: "1px solid lightgrey",
    },
    ".proca-MuiLinearProgress-root": {
      height: "12px",
      marginBottom: theme.spacing(2),
    },
    ".proca-MuiLinearProgress-colorPrimary": {
      backgroundColor: "#e8e8e8",
    },
    ".proca-MuiLinearProgress-barColorPrimary": {
      backgroundColor: "#4d9fa0",
    },
    ".proca-MuiFilledInput-root": {
      backgroundColor: "#fdfdfd!important",
    },
    ".proca-MuiButton-endIcon": {
      display: "none",
    },
    ".proca-MuiInputAdornment-root": {
      display: "none",
    },
    "#proca_submit": {
      //      borderRadius: "0px",
      fontSize: "24px",
      marginBottom: theme.spacing(1),
      color: "white",
      textTransform: "none",
    },
  },
}));

const Style = () => {
  //  const config = useCampaignConfig();
  useGlobalStyles();
  return null;
};

export default Style;
