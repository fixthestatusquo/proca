import React, { useEffect, useMemo, useRef } from "react";
import Postcode from "@components/field/Postcode";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTargets } from "@hooks/useTargets";
import { nearestWithin, rankByDistance } from "@lib/targets";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

const FilterGeo = ({ form }) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const { allowed, select, setFilter } = useTargets();
  const geoValue = form.watch("geo");
  const geoKey = geoValue ? geoValue.join(",") : "";
  const geo = useMemo(
    () => (geoKey ? geoKey.split(",").map(Number) : null),
    [geoKey]
  );
  const tolerancePercent = Number(config.component.geo?.tolerancePercent) || 0;
  const toleranceKm = Number(config.component.geo?.toleranceKm) || 0;
  const hasTolerance = tolerancePercent > 0 || toleranceKm > 0;
  const selectable = !!config.component.email?.selectable;
  const autoSelected = useRef(null);

  useEffect(() => {
    setFilter(
      "geo",
      geo
        ? {
            order: 10,
            runoff: targets =>
              nearestWithin(targets, geo, {
                percent: tolerancePercent,
                km: toleranceKm,
              }),
          }
        : { qualify: () => false }
    );
  }, [geo, tolerancePercent, toleranceKm, setFilter]);

  useEffect(() => {
    if (!geo) {
      autoSelected.current = null;
      return;
    }
    const ranked = rankByDistance(allowed, geo);
    const [nearest, second] = ranked;
    console.log(
      "[filter/Geo] nearest",
      nearest ? `${nearest.distance.toFixed(1)} km` : "none",
      nearest?.target?.name
    );
    console.log(
      "[filter/Geo] second",
      second ? `${second.distance.toFixed(1)} km` : "none",
      second?.target?.name
    );
    if (!selectable || !nearest) return;
    const key = `${geoKey}:${nearest.target.procaid}`;
    if (autoSelected.current === key) return;
    autoSelected.current = key;
    select([nearest.target.procaid]);
  }, [allowed, geo, geoKey, selectable, select]);

  return (
    <>
      <Postcode form={form} width={12} search={true} />
      {!geo && <Alert severity="info">{t("target.postcode.undefined")}</Alert>}
      {hasTolerance && !selectable && (
        <Alert severity="warning">
          {t("target.geo.selectable", {
            defaultValue:
              "Geo tolerance is configured but target selection is disabled. Enable component.email.selectable.",
          })}
        </Alert>
      )}
      <input type="hidden" {...form.register("geo")} />
    </>
  );
};

export default FilterGeo;
