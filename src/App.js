import React from 'react';
//import logo from './logo.svg';
//import './App.css';
import SignatureForm from './SignatureForm';
import FABAction from './FAB.js';
const querystring = require('querystring');

function App() {
  return (
    <div className="App">
      <FABAction />
      <SignatureForm margin= "dense" variant= "filled" />
    </div>
  );
}

export default App;
