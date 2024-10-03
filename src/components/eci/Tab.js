import React, { useState } from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";

import EmailIcon from "@material-ui/icons/FavoriteBorder";
import EciIcon from "@material-ui/icons/HowToVote";
import ShareIcon from "@material-ui/icons/Share";

import Email from "./Email";
import Support from "./Support";
import Share from "@components/Share";

export default function Target(props) {
  const [value, setValue] = useState("email");

  const handleChange = (_event, newValue) => {
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
