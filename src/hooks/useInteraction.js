import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCampaignConfig } from "@hooks/useConfig";
import dispatch from "@lib/event.js";

// Custom hook to detect the first interaction with the form
const useFirstInteraction = (form) => {
  const { formState: { isDirty } } = form;
  const [hasInteracted, setHasInteracted] = useState(false);
  const config = useCampaignConfig();
  let actionType = config.component.register?.actionType || "register";
//TODO actionType mail2target or petition

  useEffect(() => {
    if (isDirty && !hasInteracted) {
      setHasInteracted(true);
      console.log('First interaction with the form!');
      dispatch(actionType + ":start");
    }
  }, [isDirty, hasInteracted]);

  return hasInteracted;
};

export default useFirstInteraction;
