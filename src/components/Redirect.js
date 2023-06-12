import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import Alert from "@components/Alert";
import { AlertTitle } from '@mui/material';

const Redirect = () => {
  const config = useCampaignConfig();
  const url = config.component?.redirect?.url || "/";
  if (!config.component?.redirect?.url) {
    return (
      <Alert severity="error" autoHideDuration={5000}>
        <AlertTitle> Missing URL to redirect to</AlertTitle>
      </Alert>
    );
  }
  document.location.href = url;
  return null;
};

export default Redirect;
