// import React from "react";

import React, { useState } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import LockIcon from "@material-ui/icons/Lock";

import { useFormatMoney } from "@hooks/useFormatting";
import { useTranslation } from "react-i18next";



const DonateButton = (
  { amount, config, frequency, form, onSubmit },
  props
) => {

  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmitButtonClick = async (event, data) => {
    event.preventDefault();

    const btn = event.target;
    btn.disabled = true;
    setSubmitting(true); console.log("SetSubmitting true");

    const result = await form.trigger();
    if (Object.keys(form.errors).length > 0) {
      btn.disabled = false;
      console.log("SetSubmitting false");
      setSubmitting(false);
      return false;
    }

    // setSubmitting(false);

    // const f = document.getElementById('proca-sepa').submit();
    // return f.submit();
    ; p; 0
  }

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
      onClick={(e, data) => {
        onSubmitButtonClick(e, data, props.onClick);
      }}
      {...props}
    >
      {" "}
      {isSubmitting ? (
        <CircularProgress />
      ) : (<CallToAction amount={amount} frequency={frequency} config={config} />
      )}
    </Button>
  );
};

const CallToAction = ({ amount, frequency, config }) => {
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();
  /* i18next-extract-disable-next-line */
  return t("donation.button.cta." + frequency.toLowerCase(), {
    amount: formatMoney(amount)
  })
}


export default DonateButton;

export { CallToAction };
