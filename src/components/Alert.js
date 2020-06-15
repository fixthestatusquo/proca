import React from 'react';
import PropTypes from "prop-types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

const component= (props) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Snackbar open={open} key={props.text} onClose={handleClose} autoHideDuration={props.autoHideDuration}>
       <Alert severity={props.severity} onClose={handleClose}>{props.text}</Alert>
    </Snackbar>
  );

}


component.defaultProps = {
  severity : "info",
  autoHideDuration : 3000,
  text : "Hello"
}

component.propTypes = {
  severity: PropTypes.string,
  text: PropTypes.string,
  autoHideDuration: PropTypes.number
};

export default component;
