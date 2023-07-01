import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";

import EmailIcon from "@mui/icons-material/FavoriteBorder";
import EciIcon from "@mui/icons-material/HowToVote";
import ShareIcon from "@mui/icons-material/Share";

import Email from "./Email";
import Support from "./Support";
import Share from "@components/Share";

export default function Target(props) {
  const [value, setValue] = useState("email");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const doneEmail = () => {
    setValue("eci");
  };

  const doneEci = () => {
    setValue("share");
  };

  return (
    <>
      <Paper square>
        <AppBar position="static" color="default">
          <Tabs
            variant="fullWidth"
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleChange}
            aria-label="disabled tabs example"
          >
            <Tab value="email" aria-label="Email" icon={<EmailIcon />} />
            <Tab value="eci" aria-label="Eci" icon={<EciIcon />} />
            <Tab value="share" aria-label="Share" icon={<ShareIcon />} />
          </Tabs>
        </AppBar>
        <Box p={1}>
          {value === "email" && <Email done={doneEmail} />}
          {value === "eci" && <Support done={doneEci} />}
          {value === "share" && <Share done={props.done} />}
        </Box>
      </Paper>
    </>
  );
}
