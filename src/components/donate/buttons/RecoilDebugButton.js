import React from "react";
import { Button } from "@material-ui/core";
import { useRecoilCallback } from "recoil";

const DebugButton = (props) => {
  const onClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        console.debug("Atom values:");
        for (const node of snapshot.getNodes_UNSTABLE()) {
          const value = await snapshot.getPromise(node);
          console.debug(node.key, value);
        }
      },
    []
  );

  return <Button onClick={onClick}>Dump State</Button>;
};

export default DebugButton;
