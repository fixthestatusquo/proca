import { CardHeader, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import React from "react";
import { useCampaignConfig } from "../../hooks/useConfig";
import useData from "../../hooks/useData";
import { useFormatMoney } from "@hooks/useFormatting.js";

const useStyles = makeStyles((theme) => ({
  header: {
    paddingBottom: 0,
  },
}));

const DonateTitle = ({ showAverage = true }) => {
  const config = useCampaignConfig();
  const donateConfig = config.component.donation;

  const { t } = useTranslation();
  const formatMoneyAmount = useFormatMoney();

  const [data] = useData();
  const amount = data.amount;
  const frequency = data.frequency.toLowerCase();

  const classes = useStyles();

  let title = "";

  if (config?.component?.donation.igive) {

    title = donateConfig.igive;

  } else if (amount) {

    /* i18next-extract-disable-next-line */
    title = t(
      "donation.frequency.feedback." + frequency,
      { amount: formatMoneyAmount(amount), frequency: t("donation.frequency.each." + frequency) }
    );

  } else if (donateConfig.title) {

    title = donateConfig.title;

  }

  const averages = donateConfig?.average;
  let subtitle = donateConfig?.subTitle;

  if (showAverage && averages) {
    if (averages[frequency]) {
      console.log(averages[frequency], frequency);
      subtitle = t("donation.average", {
        amount: formatMoneyAmount(averages[frequency])
      });
    }
  }

  return (
    <>
      <CardHeader
        className={classes.header}
        title={title}
        subheader={subtitle}
      />
    </>
  );
};

export default DonateTitle;
