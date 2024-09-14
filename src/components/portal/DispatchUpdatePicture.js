import React from "react";
import { useEffect, useState } from "react";
import useData from "@hooks/useData";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "../../hooks/useConfig";
import { isSet, uuid as getuuid } from "@lib/uuid";
import { useTranslation } from "react-i18next";

const DispatchUpdateImage = () => {
  const [dispatched, setDispatched] = useState(false);
  const [data] = useData();
  const supabase = useSupabase();
  const { t } = useTranslation();
  const config = useCampaignConfig();
  let uuid = undefined;

console.log("dispatch update image", data);
alert ("do not use, this isn't possible to update pictures as anonymous");

  useEffect(() => {
    const updatePicture = async (data) => {
      let d = {
        uuid: getuuid(),
      };
      if (data.country) d.area = data.country;
      if (data.firstname) {
        d.creator = data.firstname.trim();
        if (data.lastname) {
          d.creator += " " + data.lastname.charAt(0).toUpperCase().trim();
        }
        if (data.locality) {
          d.creator = t("supporterHint", {
            defaultValue: "{{name}}, {{locality}}",
            name: d.creator,
            area: data.locality,
          });
        }
      } else { // should it be an error?
      }
      const { error, data: result } = await supabase.from("pictures").update([d]).eq('hash', data.hash).select();
      if (error) {
        console.error(error);
        return;
      }
      setDispatched(true);
    };

    if (dispatched || !data.hash) return null;
    updatePicture(data);
  }, [data, uuid, config, supabase, dispatched, t]);

  if (dispatched || !data.comment) return null;
  uuid = isSet() && getuuid();

  return null;
};

export default DispatchUpdateImage;
