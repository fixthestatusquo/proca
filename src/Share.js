import React from "react";

//import { Container, Grid } from "@material-ui/core";

import { useMediaQuery, Button, ButtonGroup } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1)
    }
  }
}));
/*
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
*/

export default function ShareAction(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ButtonGroup orientation="vertical" color="primary">
        <Button>Share on WhatsApp</Button>
        <Button>Share on Facebook</Button>
        <Button>Share on Twitter</Button>
        <Button>Share by Email</Button>
      </ButtonGroup>
    </div>
  );
}
