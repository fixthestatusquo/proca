import { Button, CircularProgress } from "@material-ui/core";
import LockIcon from "@material-ui/icons/Lock";

import { useTranslation } from "react-i18next";

import React from "react";

const DonateButton = (
  { amount, currency, config, frequency, isSubmitting },
  props
) => {
  const { t } = useTranslation();

  return (
    <Button
      color="primary"
      name="submit"
      variant={
        config.layout?.button?.submit?.variant ||
        config.layout?.button?.variant ||
        "contained"
      }
      fullWidth
      type="submit"
      size="large"
      startIcon={isSubmitting ? undefined : <LockIcon />}
      {...props}
    >
      {" "}
      {isSubmitting ? (
        <CircularProgress />
      ) : (
        t("Donate {{amount}} {{currency}}", {
          amount: amount,
          currency: currency.symbol,
        })
      )}
    </Button>
  );
};

export default DonateButton;
