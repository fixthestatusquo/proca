import React from 'react';
//import logo from './logo.svg';
//import './App.css';
import SignatureForm from './SignatureForm';
const querystring = require('querystring');

function App() {
  return (
    <div className="App">
      <SignatureForm margin= "dense" variant= "filled" />
    </div>
  );
}

export default App;
