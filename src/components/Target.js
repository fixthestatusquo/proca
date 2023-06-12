import React from "react";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";

import EmailIcon from "@mui/icons-material/Email";
import SvgIcon from "@mui/material/SvgIcon";
import TwitterIcon from "../images/Twitter.js";

import Email from "./Email";
import Twitter from "./Twitter";
export default function Target(props) {
  const [value, setValue] = React.useState("email");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const done = () => {
    setValue("twitter");
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
            <Tab value="email" label="Email" icon={<EmailIcon />} />
            <Tab
              value="twitter"
              label="Twitter"
              icon={
                <SvgIcon>
                  <TwitterIcon />
                </SvgIcon>
              }
            />
          </Tabs>
        </AppBar>
        <Box p={1}>
          {value === "email" && (
            <Email done={done} actionPage={props.actionPage} />
          )}
          {value === "twitter" && (
            <Twitter
              done={props.done}
              actionPage={props.actionPage}
              country={false}
            />
          )}
        </Box>
      </Paper>
    </>
  );
}
