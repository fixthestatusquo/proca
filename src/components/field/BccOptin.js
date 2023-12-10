import Checkbox from "./Checkbox";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

const BccOptin = (props) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const props2 = {
    ...props,
    ...{
      name: "bcc",
      label: t("consent.bcc", {
        defaultValue: "I want {{organisation}} to receive a copy of my message",
        organisation: config.organisation,
      }),
    },
  };
  return Checkbox(props2);
};

export default BccOptin;
