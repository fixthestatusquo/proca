import React from "react";
//import logo from './logo.svg';
//import './App.css';
import SignatureForm from "./SignatureForm";
import FABAction from "./FAB.js";
import { Wizard } from "./Wizard.js";
const querystring = require("querystring");

function App() {
  return (
    <Grid container className="App">
      <Grid item>
        <Wizard />
      </Grid>
      <Grid item>
        <FABAction />
        <SignatureForm margin="dense" variant="filled" />
      </Grid>
    </Grid>
  );
}

export default App;
