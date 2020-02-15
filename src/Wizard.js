import React from "react";

import { ButtonGroup,Button } from '@material-ui/core';

let  config= {
   data: {},
    margin: "dense",
    variant: "filled",
    selector:"#signature-form",
  };


const Wizard = (args) => {
  if (args)
    config = {...config, ...args};
  return (
    <div>
    <ButtonGroup color="primary" aria-label="outlined primary button group">
  <Button>One</Button>
  <Button>Two</Button>
  <Button>Three</Button>
</ButtonGroup>
<ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
  <Button>One</Button>
  <Button>Two</Button>
  <Button>Three</Button>
</ButtonGroup>
<ButtonGroup variant="text" color="primary" aria-label="text primary button group">
  <Button>One</Button>
  <Button>Two</Button>
  <Button>Three</Button>
</ButtonGroup>
    </div>
  );
};

export {config,Wizard};

