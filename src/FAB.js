import React, { useState } from "react";

//import { Container, Grid } from "@material-ui/core";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import {
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Slide,
  IconButton
} from "@material-ui/core";
//import DialogActions from '@material-ui/core/DialogActions';
//import DialogContentText from '@material-ui/core/DialogContentText';

import SignatureForm from "./SignatureForm.js";
import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";
import CreateIcon from "@material-ui/icons/Create";

const useStyles = makeStyles(theme => ({
  fab: {
    margin: 0,
    top: "auto",
    right: 20,
    bottom: 20,
    left: "auto",
    position: "fixed"
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FABAction() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const classes = useStyles();
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        aria-labelledby="sign-dialog-title"
        fullScreen={fullScreen}
      >
        <DialogTitle id="sign-dialog-title" className={classes.dialogTitle} disableTypography>
            <h2 className="MuiTypography-root MuiTypography-h6">Sign</h2>
            <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <SignatureForm />
        <DialogContent></DialogContent>
      </Dialog>
      <div className={classes.fab}>
        <Slide direction="right" onMountOnEnter unmountOnExit in="true">
        <Fab
          color="primary"
          variant="extended"
          aria-label="sign"
          onClick={handleClickOpen}
        >
          <CreateIcon />
          Sign&nbsp;
        </Fab>
    </Slide>
      </div>
    </div>
  );
}
