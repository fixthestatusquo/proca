import React from "react";

/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import { makeStyles } from "@material-ui/core/styles";
import { LinearProgress } from "@material-ui/core";
import useCount from '../hooks/useCount.js';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function Progress(props) {
  const count = useCount (props.actionPage);
  const classes = useStyles();

  if (!count)
    return null;
 

  return (
    <div className={classes.root}>
    <LinearProgress variant="determinate" value={count} />
    </div>
  );
  
}
