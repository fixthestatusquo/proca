import React from "react";
import { useComponentConfig } from "@hooks/useConfig";
import Alert from "@material-ui/lab/Alert";
import { AlertTitle } from "@material-ui/lab";
import LinearProgress from "@material-ui/core/LinearProgress";

const Redirect = () => {
  const component = useComponentConfig();
  const url = component.redirect?.url;
  if (!url) {
    return (
      <Alert severity="error">
        <AlertTitle> Missing URL to redirect to</AlertTitle>
        config.component.redirect.url
      </Alert>
    );
  }
  document.location.href = url;
  return (
    <>
      <Alert severty="info">Loading...</Alert>
      <LinearProgress />
    </>
  );
};

export default Redirect;
