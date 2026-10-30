// Target pipeline: all -> allowed (qualify) -> visible (runoff) -> selected.
// Pure helpers only; no React, no config.

const rad = d => (d * Math.PI) / 180;

export const distance = ([lat1, lng1], [lat2, lng2]) => {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const geoOf = target => target.fields?.geo || target.geo;

const EARTH_RADIUS_KM = 6371;

export const distanceKm = (from, to) => distance(from, to) * EARTH_RADIUS_KM;

export const rankByDistance = (targets, geo) =>
  targets
    .map(target => ({ target, distance: geoOf(target) ? distanceKm(geo, geoOf(target)) : Infinity }))
    .filter(({ distance }) => Number.isFinite(distance))
    .sort((a, b) => a.distance - b.distance);

export const nearest = (targets, geo) => {
  const [best] = rankByDistance(targets, geo);
  return best ? [best.target] : [];
};

export const nearestWithin = (targets, geo, { percent = 0, km = 0 } = {}) => {
  const ranked = rankByDistance(targets, geo);
  if (!ranked.length) return [];
  const d0 = ranked[0].distance;
  const window = Math.max(km || 0, (d0 * (percent || 0)) / 100);
  return ranked
    .filter(({ distance }) => distance <= d0 + window)
    .map(({ target }) => target);
};

export const languagesOf = (targets, field = "locale") =>
  [...new Set(targets.map(t => t[field]).filter(Boolean))].sort();

export const byCountry = country => {
  const c = country?.toLowerCase();
  return t =>
    t.country === c || t.country === "" || t.constituency?.country === c;
};

export const byConstituency = constituency => {
  if (typeof constituency === "object") {
    return t => constituency.includes(t.constituency);
  }
  return t => String(t.constituency) === String(constituency);
};

export const byArea = area => t => String(t.area) === String(area);

export const byLocale = locales => {
  if (!locales) return () => true;
  const list = Array.isArray(locales) ? locales : [locales];
  const lower = list.map(l => l.toLowerCase());
  return t =>
    !t.locale || lower.some(l => t.locale.toLowerCase().startsWith(l));
};

export const derive = (all, filters, selected) => {
  const list = Object.values(filters);

  const allowed = all.filter(t => list.every(f => !f.qualify || f.qualify(t)));

  const visible = list
    .filter(f => f.runoff)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .reduce((targets, f) => f.runoff(targets, all), allowed);

  const ids = new Set(visible.map(t => t.procaid));
  return { allowed, visible, selected: selected.filter(id => ids.has(id)) };
};

export const submitted = (visible, selected, selectable) =>
  selectable ? visible.filter(t => selected.includes(t.procaid)) : visible;

// declarative filters for the iframe/postMessage boundary
const valueAt = (target, path) =>
  path.split(".").reduce((value, key) => value?.[key], target);

export const ruleToFilter = rule => {
  if (!rule) return null;
  switch (rule.type) {
    case "field":
      return { qualify: t => valueAt(t, rule.field) === rule.value };
    case "area":
      return { qualify: byArea(rule.value) };
    case "constituency":
      return { qualify: byConstituency(rule.value) };
    case "locale":
      return { qualify: byLocale(rule.value) };
    case "nearest":
      return {
        order: rule.order ?? 10,
        runoff: targets => nearest(targets, rule.geo),
      };
    case "ids": {
      const ids = new Set(rule.ids || []);
      return {
        order: rule.order ?? 10,
        runoff: targets => targets.filter(t => ids.has(t.procaid)),
      };
    }
    default:
      return null;
  }
};
