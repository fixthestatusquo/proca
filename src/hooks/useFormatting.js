import { useCampaignConfig } from "./useConfig";

const useFormatMoney = () => {
  const campaignConfig = useCampaignConfig();
  const donateConfig = campaignConfig.component.donation;

  return (amount) => {
    return Number(amount).toLocaleString(
      campaignConfig.lang, {
      style: "currency", currency: donateConfig.currency.code
    });
  }
}

export { useFormatMoney };
