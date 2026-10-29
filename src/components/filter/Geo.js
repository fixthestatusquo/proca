import React from "react";
import Postcode from "@components/field/Postcode";
import { useTargets } from "@hooks/useTargets";
import { nearest } from "@lib/targets";
import Alert from "@material-ui/lab/Alert";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const FilterGeo = ({ form }) => {
  const { t } = useTranslation();
  const { setFilter } = useTargets();
  const geo = form.watch("geo");
  useEffect(() => {
    setFilter(
      "geo",
      geo
        ? {
            order: 10,
            runoff: allowed => nearest(allowed, geo),
          }
        : { qualify: () => false }
    );
  }, [geo, setFilter]);

  return (
    <>
      <Postcode form={form} width={12} search={true} />
      {!geo && <Alert severity="info">{t("target.postcode.undefined")}</Alert>}
      <input type="hidden" {...form.register("geo")} />
    </>
  );
};

export default FilterGeo;
