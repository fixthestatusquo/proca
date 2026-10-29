import { derive, languagesOf } from "@lib/targets";
import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

const empty = {
  all: [],
  allowed: [],
  visible: [],
  selected: [],
  filters: {},
};

export const targetStore = create(set => ({
  ...empty,

  setAll: all =>
    set(state => ({ all, ...derive(all, state.filters, state.selected) })),

  setFilter: (id, filter) =>
    set(state => {
      const filters = { ...state.filters };
      if (filter) filters[id] = filter;
      else delete filters[id];
      return { filters, ...derive(state.all, filters, state.selected) };
    }),

  select: procaids =>
    set(state => {
      const next =
        typeof procaids === "function" ? procaids(state.selected) : procaids;
      const ids = new Set(state.visible.map(t => t.procaid));
      return { selected: (next || []).filter(id => ids.has(id)) };
    }),

  selectAll: () =>
    set(state => ({
      selected: state.visible.filter(t => !t.disabled).map(t => t.procaid),
    })),

  clearSelection: () => set({ selected: [] }),

  reset: () => set({ ...empty }),
}));

export const useTargets = () =>
  targetStore(
    useShallow(state => ({
      all: state.all,
      allowed: state.allowed,
      visible: state.visible,
      selected: state.selected,
      setAll: state.setAll,
      setFilter: state.setFilter,
      select: state.select,
      selectAll: state.selectAll,
      clearSelection: state.clearSelection,
    }))
  );

export { languagesOf };

const normalize = list => {
  if (!Array.isArray(list)) return [];
  list.forEach(target => {
    if (target.country) target.country = target.country.toLowerCase();
  });
  return list;
};

// Owns the source: props.targets, config.email.to, or the published target list.
export const useTargetSource = ({ targets, config }) => {
  useEffect(
    () => () => {
      targetStore.getState().reset();
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const apply = list => {
      if (cancelled) return;
      const hook = config.hook?.["target:load"];
      const loaded = normalize(typeof hook === "function" ? hook(list) : list);
      targetStore.getState().setAll(loaded);
    };

    const fail = error => {
      if (cancelled) return;
      apply([
        {
          name: error.toString(),
          description: "Please check your internet connection and try later",
          constituency: "",
          disabled: true,
        },
      ]);
    };

    if (targets) {
      apply(targets);
      return () => {
        cancelled = true;
      };
    }

    const email = config.component.email || {};

    if (email.to) {
      const to = (typeof email.to === "string" ? email.to.split(",") : [])
        .map(d => ({ email: d.trim() }))
        .filter(d => d.email);
      apply(to);
      return () => {
        cancelled = true;
      };
    }

    const url =
      typeof email.listUrl === "string"
        ? email.listUrl
        : `https://widget.proca.app/t/${config.campaign.name}.json`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw res.statusText || `${res.status} error`;
        return res.json();
      })
      .then(apply)
      .catch(fail);

    return () => {
      cancelled = true;
    };
  }, [targets, config.component, config.hook, config.campaign?.name]);
};
