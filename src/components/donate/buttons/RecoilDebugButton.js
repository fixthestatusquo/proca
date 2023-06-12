import React from "react";
import { Button } from "@mui/material";
import { useRecoilCallback } from "recoil";

const DebugButton = () => {
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
