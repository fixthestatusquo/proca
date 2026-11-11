export const journeyConfig = journey => ({
  lang: "en",
  locale: "en",
  journey,
  portal: [],
  actionPage: 1,
  campaign: { name: "test", title: "Test campaign" },
  org: { name: "Test org", primaryColor: "#1976d2" },
  layout: { primaryColor: "#1976d2", theme: "light" },
  locales: {
    "common:": {
      action: { sign: "Sign now", register: "Sign now" },
      share: { title: "Share now", intro: "Tell others about it" },
    },
  },
  param: { locales: {} },
  hook: {},
  component: {
    widget: { fab: false },
    counter: false,
    consent: {},
    register: { field: {}, button: "action.sign" },
    share: { top: false, next: false },
    donation: {},
  },
});
