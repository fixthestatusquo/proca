import React from 'react';
import TextField from "@components/TextField";
import {toObject} from "@lib/text";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from 'react-i18next';

const Select = ({ form, name, label, options: key, sort, required }) => {
  const config = useCampaignConfig();
  const { t, i18n } = useTranslation();
  let options = [["error","error"]];
  const locale = config.lang;
  if (!key) {
    console.error ("missing options (locale key), for instance 'common:action'" + key);
    options = [["error_missing", "missing locale props"]];
  }
  try {
    if (i18n.exists(key)) {
      const asString = t(key,{returnObjects: false, returnedObjectHandler: (key) => `"${key}" with returnedObjectHandler`});
      // HACK: if it's an object, returnedObjecHandler should be triggered, but instead, it returns a string with an error message
      if (asString.endsWith('returned an object instead of string.')) {
        options = Object.entries(t(key, { returnObjects: true}));
      } else {
        options = Object.entries (toObject(asString));
      }
    } else {
    options = [["error_nolocales", "missing locale "+key]];
    } 
  } catch {
     console.log("invalid key", key);
  }


  switch  (sort) {
    case "value" : 
     options = options.sort(([, a], [, b]) => a.localeCompare(b,locale));
     break;
    case undefined: 
    default:
     break;
  }
  return (
    <TextField
          select={true}
          name={name}
          required={required}
          label={t(label || name)}
          form={form}
          SelectProps={{
            native: true,
          }}
        >
      <option key="empty" value=""></option>
          {options.map(([k, v]) => {
            return (
              <option key={k} value={v}>
                {v}
              </option>
            );
          })}
    </TextField>
  );
};

export default Select;