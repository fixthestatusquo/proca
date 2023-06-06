import React from "react";
import PropTypes from "prop-types";
import Snackbar from "@material-ui/core/Snackbar";
import { Alert, AlertTitle } from "@material-ui/lab";
import Slide from "@material-ui/core/Slide";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  title: {
    fontSize: 22,
  },
  bigger: {
    fontSize: 18,
  },
}));

function Transition(props) {
  return <Slide {...props} direction="up" />;
}
const ProcaAlert = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Snackbar
      open={open}
      key={props.text}
      onClose={handleClose}
      TransitionComponent={Transition}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={props.autoHideDuration}
    >
      <Alert
        severity={props.severity}
        onClose={handleClose}
        icon={props.icon}
        className={classes.bigger}
      >
        {props.title && (
          <AlertTitle classes={{ root: classes.title }}>
            {props.title}
          </AlertTitle>
        )}
        {props.children || props.text}
      </Alert>
    </Snackbar>
  );
};

ProcaAlert.defaultProps = {
  autoHideDuration: 4000,
  severity: "info",
  text: "Hello",
};

ProcaAlert.propTypes = {
  severity: PropTypes.string,
  text: PropTypes.string,
  autoHideDuration: PropTypes.number,
};

export default ProcaAlert;
