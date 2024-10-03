import React, { useEffect } from "react";
import Postcode from "@components/field/Postcode";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

const FilterArea = props => {
  const { t } = useTranslation();
  const { watch } = props.form;
  const area = watch("area");
  useEffect(() => {
    console.log("changing area", area);
    if (!area)
      return props.selecting(() => ({
        filter: "area",
        key: "area",
        value: false,
        reset: false,
      }));

    props.selecting(
      "constituency",
      area > 9 ? area.toString() : `0${area.toString()}`
    );
  }, [area]);
  console.log(area);

  return (
    <>
      <Postcode form={props.form} width={12} search={true} />
      {!props.form.getValues("postcode") && (
        <Alert severity="info">{t("target.postcode.undefined")}</Alert>
      )}
    </>
  );
};

export default FilterArea;
