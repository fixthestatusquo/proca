import React from "react";
import PropTypes from "prop-types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import Slide from '@material-ui/core/Slide';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  bigger: {
      fontSize: '1.2rem'
}
}));

function Transition(props) {
  return <Slide {...props} direction="top" />;
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
      <Alert severity={props.severity} onClose={handleClose}
    className={classes.bigger}
    >
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
