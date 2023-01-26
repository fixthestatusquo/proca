import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
//import { useTranslation } from "react-i18next";

const MaskImage = (props) => {
  const config = useCampaignConfig();
  const url = config.component.camera?.mask;
  return (
    <img id="mask" src={url} style={{ position: "absolute", width: "100%" }} />
  );
};

export default MaskImage;
