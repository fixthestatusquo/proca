import React, { useState, useEffect } from "react";

//import { Container, Grid } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  IconButton,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles(theme => ({
  DialogContent: {
    color: theme.palette.text.primary,
    "& p, & li": {
      color: theme.palette.text.primary,
    },
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "& h2": {
      margin: "0!important",
    },
  },
}));

function OpenDialog(props) {
  const config = useCampaignConfig();
  const [open, setOpen] = useState(props.dialog || false);
  const DialogAction = props.Action;

  const title =
    props.name ||
    config.param.locales["dialog-title"] ||
    config.campaign?.title;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("xs"), {
    noSsr: true,
  });
  useEffect(() => setOpen(props.dialog), [props.dialog]);

  const handleClose = () => {
    if (!props.dialog) setOpen(false);

    if (props.close instanceof Function) {
      props.close();
    } else {
      if (props.done instanceof Function) props.done();
    }
  };

  const classes = useStyles();
  //{React.cloneElement(props.children, { setTitle: setTitle, title: title })}
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      fullScreen={props.fullScreen || fullScreen}
      maxWidth={props.maxWidth || "md"}
      hideBackdrop={props.hideBackdrop || false}
    >
      {title ? (
        <DialogTitle className={classes.dialogTitle} disableTypography>
          <h2>{title}</h2>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      ) : null}
      <DialogContent className={classes.DialogContent}>
        {props.children}
      </DialogContent>
      {DialogAction && <DialogAction />}
    </Dialog>
  );
}

OpenDialog.defaultProps = {
  dialog: true,
};

export default OpenDialog;
//export default {Open,Close};
