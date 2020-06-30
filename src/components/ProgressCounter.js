import React from "react";

/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import { makeStyles } from "@material-ui/core/styles";
import { LinearProgress, Box } from "@material-ui/core";
import useCount from '../hooks/useCount.js';
//3,014,823 have signed. Let’s get to 4,500,000!
import { useTranslation } from "react-i18next";


const useStyles = makeStyles(theme => ({
  root: {
    fontSize: theme.typography.pxToRem(18),
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const nextStep = (value) => {
  const steps = [100,200,500,1000,2000,5000,10000,20000,50000,100000,200000,500000,1000000,150000,2000000,5000000,1000000];
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

const normalise = (value,max) => {
  return value*100/max;
};

export default function Progress(props) {
  const { t } = useTranslation();
  let count = props.count;
   count = useCount (props.actionPage) || props.count;
  const classes = useStyles();
  const goal = nextStep (count);
  if (!count)
    return null;
 

  return (
    <Box className={classes.root}>
    {t("progress",{count:count,goal:goal})}
    <LinearProgress variant="determinate" value={normalise(count,goal)} />
    </Box>
  );
  
}
