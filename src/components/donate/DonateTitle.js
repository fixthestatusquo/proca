import { CardHeader } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import React from "react";

const DonateTitle = ({ config, currency, frequency, amount }) => {
  const donateConfig = config.component.donation;
  const { t } = useTranslation();

  let title = t("Choose your donation amount");
  if (config?.component?.donation.igive) {
    title = config?.component?.donation.igive;
  } else if (amount) {
    title = t("I'm donating {{amount}} {{ currency.symbol }} {{ frequency }}", {
      amount: amount.toString(),
      currency: currency,
      frequency: frequency === "oneoff" ? "" : t("a " + frequency),
    });
  } else if (config?.component.donation?.title) {
    title = config?.component.donation?.title;
  }

  const averages = donateConfig?.average;
  const subtitle =
    averages && averages[frequency]
      ? t(
          "The average {{frequency}} donation is {{amount}} {{currency.symbol}}",
          {
            amount: averages[frequency],
            currency: currency,
            frequency: frequency === "oneoff" ? "" : t(frequency),
          }
        )
      : donateConfig?.subTitle;

  return (
    <div>
      <CardHeader title={title} subheader={subtitle} />
    </div>
  );
};

export default DonateTitle;
