import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useGlobalStyles = makeStyles({
  "@global": {
    ".count": { display: "flex" },
    ".goal": {
      marginLeft: "auto",
      fontSize: "0.8em",
      paddingRight: "8px",
      borderRight: "1px solid lightgrey",
    },
    ".proca-MuiLinearProgress-root": {
      height: "12px",
    },
    ".proca-MuiLinearProgress-barColorPrimary": {
      backgroundColor: "#4d9fa0",
    },
    "#proca_submit": {
      //      borderRadius: "0px",
      fontSize: "24px",
      color: "white",
      textTransform: "none",
    },
  },
});

const Style = () => {
  //  const config = useCampaignConfig();
  useGlobalStyles();
  return null;
};

export default Style;
