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

export const nearest = (targets, geo) => {
  let best = null;
  let min = Infinity;
  for (const target of targets) {
    const t = geoOf(target);
    if (!t) continue;
    const d = distance(geo, t);
    if (d < min) {
      min = d;
      best = target;
    }
  }
  return best ? [best] : [];
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
