export const getItems = config => {
  try {
    const e = JSON.parse(
      window.localStorage.getItem(config?.item || "proca_data")
    );
    if (config?.rename) {
      const keys = Object.keys(config.rename);
      const r = {};
      for (const [key, value] of Object.entries(e)) {
        if (keys.includes(key)) {
          r[config.rename[key]] = value;
        } else {
          r[key] = value;
        }
      }
      return r;
    }
    return e;
  } catch {
    return {};
  }
};

export const setItems = (key, data) => {
  window.localStorage.setItem(key, data);
};
