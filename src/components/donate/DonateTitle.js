import { CardHeader, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import React from "react";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";

const useStyles = makeStyles((theme) => ({
  header: {
    paddingBottom: 0,
  },
}));

const DonateTitle = () => {
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;
  const currency = donateConfig.currency;

  const { t } = useTranslation();

  const [data] = useData();
  const amount = data.amount;
  const frequency = data.frequency;

  const classes = useStyles();

  let title = t("Choose your donation amount");
  if (config?.component?.donation.igive) {
    title = config?.component?.donation.igive;
  } else if (amount) {
    switch (frequency) {
      case "monthly":
        title = t("I'm donating {{amount}} {{currency}} monthly", {
          amount: Number(amount).toFixed(2).toLocaleString(),
          currency: currency.symbol,
        });
        break;

      case "oneoff":
      default:
        title = t("I'm donating {{amount}} {{currency}}", {
          amount: Number(amount).toFixed(2).toLocaleString(),
          currency: currency.symbol,
        });
    }
  } else if (config?.component.donation?.title) {
    title = config?.component.donation?.title;
  }

  const averages = donateConfig?.average;
  let subtitle = donateConfig?.subTitle;

  if (averages) {
    console.log("averages", averages);
    if (averages[frequency]) {
      console.log("frequency ", frequency, "average", averages[frequency]);
      subtitle = t("The average donation is {{amount}} {{currency}}", {
        amount: Number(averages[frequency]).toFixed(2).toLocaleString(),
        currency: currency.symbol,
      });
    }
  }

  return (
    <div>
      <CardHeader
        className={classes.header}
        title={title}
        subheader={subtitle}
      />
    </div>
  );
};

export default DonateTitle;
