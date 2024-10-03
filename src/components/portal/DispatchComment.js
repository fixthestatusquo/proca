import { useEffect, useState } from "react";
import useData from "@hooks/useData";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "../../hooks/useConfig";
import { isSet, uuid as getuuid } from "@lib/uuid";
import { useTranslation } from "react-i18next";

const DispatchPublicComment = () => {
// it works because data is updated after the action is saved, but it needs to be into a portal, otherwise it will be re-written when switching to the next step after register
  const [dispatched, setDispatched] = useState(false);
  const [data] = useData(); 
  const supabase = useSupabase();
  const { t } = useTranslation();
  const config = useCampaignConfig();
  let uuid = undefined;

  useEffect(() => {
    const saveComment = async (data) => {
      const d = {
        campaign: config.campaign.name,
        widget_id: config.actionpage,
        uuid: getuuid(),
        lang: config.locale,
        comment: data.comment,
      };
      if (data.country) d.area = data.country;
      if (data.firstname) {
        d.name = data.firstname.trim();
        if (data.lastname) {
          d.name += ` ${data.lastname.charAt(0).toUpperCase().trim()}`;
        }
        if (data.locality) {
          d.locality = data.locality;
          d.name = t("supporterHint", {
            defaultValue: "{{name}}, {{locality}}",
            name: d.name,
            area: data.locality,
          });
        }
      } else {
        return; //should it be an error?
      }
      const { error } = await supabase.from("comments").insert([d]);
      if (error) {
        console.error(error);
        return;
      }
      setDispatched(true);
    };

    if (dispatched || !data.comment) return null;
    saveComment(data);
  }, [data, uuid, config, supabase, dispatched, t]);

  if (dispatched || !data.comment) return null;
  uuid = isSet() && getuuid();

  return null;
};

export default DispatchPublicComment;
