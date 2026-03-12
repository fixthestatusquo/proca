import { useEffect, useState } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import dispatch from "@lib/event.js";

// Custom hook to detect the first interaction with the form
export const useFirstInteraction = form => {
  const {
    formState: { isDirty },
  } = form;
  const [hasInteracted, setHasInteracted] = useState(false);
  const config = useCampaignConfig();
  const actionType = config.component.register?.actionType || "register";
  //TODO actionType mail2target or petition

  useEffect(() => {
    if (isDirty && !hasInteracted) {
      setHasInteracted(true);
      console.log("First interaction with the form!");
      dispatch(actionType + ":start");
    }
  }, [isDirty, hasInteracted, actionType]);

  return hasInteracted;
};

export default useFirstInteraction;
