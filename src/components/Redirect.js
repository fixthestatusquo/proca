import { useCampaignConfig } from "@hooks/useConfig";

const Redirect = () => {
  const config = useCampaignConfig();
  document.location = config.component.redirect.url;
  return null;
}

export default Redirect;