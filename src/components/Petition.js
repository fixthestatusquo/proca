import React from "react";

import ProgressCounter from "./ProgressCounter";
import Register from "./Register";


export default function SignatureForm(props) {
  return (
    <div>
      <ProgressCounter actionPage={props.actionPage} />
      <Register{...props} />
    </div>
  );
}
