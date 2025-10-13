import React from 'react';
import { useAlertStore } from '@hooks/useAlert';

import Alert  from "@components/Alert";

export const AlertRenderer = () => {
  const alerts = useAlertStore(state => state.alerts);
  const removeAlert = useAlertStore(state => state.removeAlert);

  const currentAlert = alerts[0];

  const handleExited = () => {
    if (currentAlert) {
//      removeAlert(currentAlert.id);
    }
  };
  return (
    <>
      {currentAlert && (
        <Alert
          key={currentAlert.id}
          {...currentAlert}
          onExited={handleExited}
        />
      )}

    </>
  );
};
