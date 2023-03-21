import React, { useEffect, useState } from "react";
import useData from "@hooks/useData";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "../../hooks/useConfig";
import { isSet, uuid as getuuid } from "@lib/uuid";
import { useTranslation } from "react-i18next";
const DispatchPublicComment = (props) => {
  const [dispatched, setDispatched] = useState(false);
  const [data] = useData();
  const supabase = useSupabase();
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const campaign = config?.campaign.name;
  const actionpage = config?.actionpage;
  let uuid = undefined;

  useEffect(() => {
    const saveComment = async (data) => {
      let d = {
        campaign: campaign,
        widget_id: actionpage,
        uuid: getuuid(),
        lang: config.locale,
        comment: data.comment,
      };
      if (data.country) d.area = data.country;
      if (data.firstname) {
        d.name = data.firstname.trim();
        if (data.lastname) {
          d.name += " " + data.lastname.charAt(0).toUpperCase().trim();
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
  }, [data, uuid, campaign, actionpage, supabase, dispatched]);

  if (dispatched || !data.comment) return null;
  uuid = isSet() && getuuid();

  return null;
};

export default DispatchPublicComment;
