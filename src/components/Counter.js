import React, { useEffect, useState} from "react";

import { Container, Grid } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import { makeStyles } from "@material-ui/core/styles";
import {getCount} from '../lib/server.js';

export default function Counter(props) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    (async function () {
      const count = await getCount(props.actionPage);
      setCount(count);
    })();
  },[props.actionPage]);

  if (!count)
  return null;

  return (
    <div> Count: {count}</div>
  );
  
}
