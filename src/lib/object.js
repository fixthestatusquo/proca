/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 */
export const merge = (...objects) => {
  const isObject = obj => obj && typeof obj === "object";
  return objects.reduce((prev, obj) => {
    const result = Object.assign({}, prev);
    Object.keys(obj).forEach(key => {
      const pVal = result[key];
      const oVal = obj[key];
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        result[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        result[key] = merge(pVal, oVal);
      } else {
        result[key] = oVal;
      }
    });
    return result;
  }, {});
};

export const get = (object, path) => {
  if (!object || !path) return undefined;
  return path.split(".").reduce((current, prop) => current?.[prop], object);
};

export const set = (obj, path, value) => {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return obj;
};
