import React from "react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";

import EmailIcon from "@material-ui/icons/Email";
import SvgIcon from "@material-ui/core/SvgIcon";
import TwitterIcon from "../images/Twitter.js";

import Email from "./Email";
import Twitter from "./Twitter";
export default function Target(props) {
  const [value, setValue] = React.useState("email");

  const handleChange = (_event, newValue) => {
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
