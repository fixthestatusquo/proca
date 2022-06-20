import React, { useRef, useEffect } from "react";
import { portals } from "../../actionPage";
import { useCampaignConfig } from "@hooks/useConfig";

const CustomFields = (props) => {
  const position = props.position || "bottom";
  const config = useCampaignConfig();
  const customFields = useRef({});
  if (props.myref && !props.myref.current.beforeSubmit) {
    props.myref.current.beforeSubmit = async (data) => {
      console.log("prepareData in custom field", data);

      if (!data) return null;
      const names = Object.keys(customFields.current);
      console.log(customFields.current, names);
      for (const name in names) {
        const fct = customFields.current[name];

        console.log(fct);
        if (fct) data = await fct(data);
      }
      console.log(data);
      return data;
    };
  }

  let components = config.component.register?.custom[position];
  if (!components)
    return "ERROR missing config.component.register.custom." + position;
  if (!Array.isArray(components)) components[0] = components;

  return components.map((d) => {
    const Custom = portals[d];
    return <Custom myref={customFields} name={d} key={d} {...props} />;
  });
};

export default CustomFields;
