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
//3,014,823 have signed. Let’s get to 4,500,000!

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

function nextStep (value) {
  const steps = [100,200,500,1000,2000,5000,10000,20000,50000,100000,200000,500000,1000000,2000000,5000000,1000000];
  let next = false;

  steps.some ((step, i) =>{
    if (value < step) {
      next=step;
      return true;
    }
    return false;
  })
  return next;
}

export default function Progress(props) {
  const count = useCount (props.actionPage);
  const classes = useStyles();
  const goal = nextStep (count);
  if (!count)
    return null;
 

  return (
    <div className={classes.root}>
    {count} have signed. Let’s get to {goal}!
    <LinearProgress variant="determinate" value={count} />
    </div>
  );
  
}
