import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import TwitterAction from "./Action";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    overflow: "auto",
    maxHeight: 300,
  },
}));

const Component = (props) => {
  const classes = useStyles();
  console.log(
    props.profiles.length,
    props.profiles[0] && props.profiles[0].country
  );
  return (
    <List className={classes.root}>
      {props.profiles.map((d) => (
        <TwitterAction
          clickable={props.clickable}
          form={props.form}
          key={d.procaid}
          actionPage={props.actionPage}
          done={props.done}
          actionUrl={props.actionUrl}
          {...d}
        ></TwitterAction>
      ))}
    </List>
  );
};

export default Component;
