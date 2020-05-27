import React from "react";
  
import { Grid } from '@material-ui/core';

//import logo from './logo.svg';
//import './App.css';
import Petition fr "./Petition";
import FABAction from "./FAB";
import { Wizard } from "./Wizard";
const querystring = require("querystring");

function App() {
  return (
    <Grid container className="App">
      <Grid item>
        <Wizard />
      </Grid>
      <Grid item>
        <FABAction />
        <Petition margin="dense" variant="filled" />
      </Grid>
    </Grid>
  );
}

export default App;
