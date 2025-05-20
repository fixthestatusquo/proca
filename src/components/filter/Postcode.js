import React, { useEffect } from "react";
import Postcode from "@components/field/Postcode";
//import { useCampaignConfig, useSetCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import Alert from "@material-ui/lab/Alert";


const FilterPostcode = props => {
  const { watch } = props.form;
  const { t } = useTranslation();
//  const config = useCampaignConfig();
//  const setConfig = useSetCampaignConfig();
  const postcode = watch("postcode");

  useEffect(() => {
// TODO: move the filtering of profiles from Mail component to here
    if (postcode === "") {
      props.selecting(() => false); // return no profile
    }
    //props.selecting("locale", language);
  }, [postcode]);

  return (
        <>
          <Postcode form={props.form} width={12} search={true} />
          {!props.form.getValues("postcode") && (
            <Alert severity="info">{t("target.postcode.undefined")}</Alert>
          )}
          <input type="hidden" {...props.form.register("area")} />
          <input type="hidden" {...props.form.register("constituency")} />
        </>
  );
};

export default FilterPostcode
