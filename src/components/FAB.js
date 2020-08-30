import React from "react";

//import { Container, Grid } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { Fab, Button, Slide, Badge } from "@material-ui/core";
//import DialogActions from '@material-ui/core/DialogActions';
//import DialogContentText from '@material-ui/core/DialogContentText';
import { useTranslation } from "react-i18next";

import useCount from "../hooks/useCount.js";
//import CloseIcon from "@material-ui/icons/Close";
import CreateIcon from "@material-ui/icons/Create";

const useStyles = makeStyles(theme => ({
  fab: {
    margin: 0,
    top: "auto",
    right: 20,
    bottom: 20,
    left: "auto",
    position: "fixed",
    zIndex: theme.zIndex['tooltip']

  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}));

/*const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
*/
export default function FABAction(props) {
  //  const theme = useTheme();

  const { t } = useTranslation();

  let counter = useCount(props.actionPage);

  const handleClickOpen = () => {
    props.done();
  };

  const classes = useStyles();
  return (
    <>
      <Button
        variant="contained"
        fullWidth
        type="submit"
        size="large"
        onClick={handleClickOpen}
        endIcon={<CreateIcon />}
      >
        {" "}
        {t("Sign now!")}
      </Button>

      <div className={classes.fab}>
        <Slide direction="right" mountOnEnter unmountOnExit in={true}>
          <Badge
            badgeContent={counter}
            max={9999999}
            color="secondary"
            overlap="circle"
          >
            <Fab
              color="primary"
              variant="extended"
              aria-label={t("Sign now!")}
              onClick={handleClickOpen}
            >
              <CreateIcon />
              {t("Sign now!")}&nbsp;
            </Fab>
          </Badge>
        </Slide>
      </div>
    </>
  );
}
