import React from 'react';
import PropTypes from "prop-types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

const component= (props) => {
  return (
    <Snackbar open={true} autoHideDuration={props.autoHideDuration}>
       <Alert severity={props.severity}>{props.text}
          </Alert>
        </Snackbar>
      );

}


component.defaultProps = {
  severity : "info",
  autoHideDuration : 6000,
  text : "Hello"
}

component.propTypes = {
  severity: PropTypes.string,
  text: PropTypes.string,
  autoHideDuration: PropTypes.number
};

export default component;
