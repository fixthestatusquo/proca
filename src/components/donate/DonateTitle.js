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
    console.log("freq", frequency);
    switch (frequency) {
      case "monthly":
        title = t("I'm donating {{amount}}{{ currency }} monthly", {
          amount: amount.toString(),
          currency: currency.symbol,
        });
        break;

      case "oneoff":
      default:
        title = t("I'm donating {{amount}}{{ currency }}", {
          amount: amount.toString(),
          currency: currency.symbol,
        });
    }
  } else if (config?.component.donation?.title) {
    title = config?.component.donation?.title;
  }

  const averages = donateConfig?.average;
  console.log(averages, frequency);
  const subtitle =
    averages && averages[frequency]
      ? t("The average donation is {{amount}}{{currency.symbol}}", {
          amount: averages[frequency],
          currency: currency,
        })
      : donateConfig?.subTitle;

  return (
    <div>
      <CardHeader title={title} subheader={subtitle} />
    </div>
  );
};

export default DonateTitle;
