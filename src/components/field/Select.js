import React from "react";
import TextField from "@components/field/TextField";
import { toObject } from "@lib/text";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const Select = ({
  form,
  name,
  label,
  options: key,
  sort,
  required,
  select = "value",
  children,
  onChange,
}) => {
  const config = useCampaignConfig();
  const { t, i18n } = useTranslation();
  let options = [["error", "error"]];
  const locale = config.lang;
  if (!key) {
    console.error(
      "missing options (locale key), for instance 'common:action'" + key
    );
    options = [["error_missing", "missing locale props"]];
  }
  try {
    if (i18n.exists(key)) {
      const asString = t(key, {
        returnObjects: false,
        returnedObjectHandler: key => `"${key}" with returnedObjectHandler`,
      });
      // HACK: if it's an object, returnedObjecHandler should be triggered, but instead, it returns a string with an error message
      if (asString.endsWith("returned an object instead of string.")) {
        options = Object.entries(t(key, { returnObjects: true }));
      } else {
        options = Object.entries(toObject(asString));
      }
    } else {
      options = [["error_nolocales", "missing locale:" + key]];
    }
  } catch {
    if (typeof key === "object") {
      options = Object.entries(key);
    } else {
      console.log("invalid key", key);
    }
  }

  switch (sort) {
    case "value":
      options = options.sort(([, a], [, b]) => a.localeCompare(b, locale));
      break;
    case undefined:
    default:
      break;
  }
  if (required && !form.getValues(name)) {
    const defaultValue = select === "value" ? options[0][1] : options[0][0];
    form.setValue(name, defaultValue);
  }
  return (
    <>
      <TextField
        select={true}
        name={name}
        required={required}
        label={label === false ? "" : t(label || name)}
        form={form}
        onChange={onChange}
        SelectProps={{
          native: true,
        }}
      >
        {!required && <option key="empty" value="" />}
        {options.map(([k, v]) => {
          return (
            <option key={k} value={select === "value" ? v : k}>
              {v}
            </option>
          );
        })}
      </TextField>
      {children}
    </>
  );
};

export default Select;
