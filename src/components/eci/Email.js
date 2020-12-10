import React from "react";
import Register from "../Register";
import { Button } from "@material-ui/core";

const RegisterEmail = (props) => {
  return (
    <>
      <Register {...props} />
      <Button fullWidth onClick={props.done}>
        Skip and go directly to signing the initiative in step 2
      </Button>
    </>
  );
};

export default RegisterEmail;
