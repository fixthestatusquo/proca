
import Postcode from "@components/field/Postcode";
import { useTargets } from "@hooks/useTargets";
import { byArea } from "@lib/targets";
import Alert from "@material-ui/lab/Alert";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const FilterArea = ({ form }) => {
  const { t } = useTranslation();
  const { setFilter } = useTargets();
  const area = form.watch("area");

  useEffect(() => {
    setFilter("area", area ? { qualify: byArea(area) } : null);
  }, [area, setFilter]);

  return (
    <>
      <Postcode form={form} width={12} search={true} />
      {!form.getValues("postcode") && (
        <Alert severity="info">{t("target.postcode.undefined")}</Alert>
      )}
    </>
  );
};

export default FilterArea;
