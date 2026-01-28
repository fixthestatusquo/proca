import { useCampaignConfig } from "./useConfig";

const useFormatNumber = () => {
  const campaignConfig = useCampaignConfig();
  return d => Number(d).toLocaleString(campaignConfig.lang);
};

const useFormatMoney = () => {
  const campaignConfig = useCampaignConfig();
  const donateConfig = campaignConfig.component.donation;

  return amount => {
    const maxDigit = Math.round(amount) === amount ? 0 : 2;
    return Number(amount).toLocaleString(campaignConfig.lang, {
      style: "currency",
      maximumFractionDigits: maxDigit,
      currency: donateConfig.currency.code,
      //      currencyDisplay: "code",
    });
  };
};

export { useFormatMoney, useFormatNumber };
