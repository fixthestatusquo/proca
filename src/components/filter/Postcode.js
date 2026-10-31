
import Postcode from "@components/field/Postcode";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTargets } from "@hooks/useTargets";
import { byArea, byConstituency } from "@lib/targets";
import Alert from "@material-ui/lab/Alert";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

const FilterPostcode = ({ form }) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const { all, setFilter } = useTargets();
  const postcode = form.watch("postcode");
  const area = form.watch("area");
  const constituency = form.watch("constituency");
  const configured = config.component.email?.filter?.includes("postcode");

  const match = useMemo(
    () =>
      constituency ? byConstituency(constituency) : area ? byArea(area) : null,
    [constituency, area]
  );

  useEffect(() => {
    if (match) {
      setFilter("postcode", { qualify: match });
    } else if (configured || postcode) {
      // keep the list empty until the lookup resolves area/constituency
      setFilter("postcode", { qualify: () => false });
    } else {
      setFilter("postcode", null);
    }
  }, [match, configured, postcode, setFilter]);

  useEffect(() => {
    if (!match) {
      form.clearErrors("postcode");
      return;
    }
    if (all.length > 0 && all.filter(match).length === 0) {
      form.setError("postcode", {
        message: t("target.postcode.empty", {
          defaultValue: "there is no-one to contact in {{area}}",
          area: area || postcode,
        }),
        type: "no_empty",
      });
    } else {
      form.clearErrors("postcode");
    }
  }, [all, match, area, postcode, form, t]);

  return (
    <>
      <Postcode form={form} width={12} search={true} />
      {!postcode && (
        <Alert severity="info">{t("target.postcode.undefined")}</Alert>
      )}
      <input type="hidden" {...form.register("area")} />
      <input type="hidden" {...form.register("constituency")} />
      <input type="hidden" {...form.register("geo")} />
    </>
  );
};

export default FilterPostcode;
