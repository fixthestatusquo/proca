// import React from "react";

import React from "react";
import { Button, CircularProgress } from "@material-ui/core";
import LockIcon from "@material-ui/icons/Lock";

import { useFormatMoney } from "@hooks/useFormatting";
import { useTranslation } from "react-i18next";

const DonateButton = ({ amount, config, frequency, isSubmitting }, props) => {
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
        <CallToAction amount={amount} frequency={frequency} config={config} />
      )}
    </Button>
  );
};

const CallToAction = ({ amount, frequency }) => {
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();
  /* i18next-extract-disable-next-line */
  return t(`donation.button.cta.${frequency.toLowerCase()}`, {
    amount: formatMoney(amount),
  });
};

export default DonateButton;

export { CallToAction };
