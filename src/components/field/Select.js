import TextField from "@components/field/TextField";
import { useCampaignConfig } from "@hooks/useConfig";
import { toObject } from "@lib/text";
import { useEffect, useState } from "react";
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
  short,
}) => {
  const config = useCampaignConfig();
  const { t, i18n } = useTranslation();
  let options = [["error", "error"]];
  const locale = config.lang;
  if (!key) {
    console.error(
      `missing options (locale key), for instance 'common:action'${key}`
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
      options = [["error_nolocales", `missing locale:${key}`]];
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
  // a native select shows the text of the selected option when closed, so pick that text per render:
  // short[value] while the list is closed, the full text as soon as it opens
  const current = form.watch(name);
  const [open, setOpen] = useState(false);

  // setValue during render would update the parent form component mid-render
  // biome-ignore lint/correctness/useExhaustiveDependencies: only the initial default matters
  useEffect(() => {
    if (required && options[0] && !form.getValues(name)) {
      form.setValue(name, select === "value" ? options[0][1] : options[0][0]);
    }
  }, []);
  const text = (value, label) =>
    !open && current === value && short?.[value] ? short[value] : label;

  return (
    <>
      <TextField
        select={true}
        name={name}
        required={required}
        label={label === false ? "" : t(label || name)}
        form={form}
        onMouseDown={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={e => {
          setOpen(false);
          if (onChange) onChange(e);
        }}
        SelectProps={{
          native: true,
        }}
      >
        {!required && <option key="empty" value="" />}
        {options.map(([k, v]) => {
          const value = select === "value" ? v : k;
          return (
            <option key={k} value={value}>
              {text(value, v)}
            </option>
          );
        })}
      </TextField>
      {children}
    </>
  );
};

export default Select;
