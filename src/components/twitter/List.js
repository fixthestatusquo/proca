import React from "react";
import PropTypes from "prop-types";
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

const component = (props) => {
  const classes = useStyles();

  return (
    <List className={classes.root}>
      {props.profiles.map((d) => (
        <TwitterAction
          clickable={props.clickable}
          form={props.form}
          key={d.id}
          actionPage={props.actionPage}
          done={props.done}
          actionUrl={props.actionUrl}
          {...d}
        ></TwitterAction>
      ))}
    </List>
  );
};

// you can have actionText (text of function(profile))
component.propTypes = {
  actionUrl: PropTypes.string,
  actionText: PropTypes.string,
};
export default component;
