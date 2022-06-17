import { portals } from "../../actionPage";
import { useCampaignConfig } from "@hooks/useConfig";

const CustomFields = (props) => {
  const position = props.position || "bottom";
  const config = useCampaignConfig();
  const dataPreparers = [];

  const registerProcessor = (fct) => {
    console.log("customfield going to prepareDate");
    dataPreparers.push(fct);
  };

  const prepareData = (data) => {
    dataPreparers.forEarch((fct) => {
      data = fct(data);
    });
    return data;
  };

  let components = config.component.register?.custom[position];
  if (!components)
    return "ERROR missing config.component.register.custom." + position;
  if (!Array.isArray(components)) components[0] = components;

  return components.map((d) => {
    const Custom = portals[d];
    return <Custom registerProcessor={registerProcessor} key={d} {...props} />;
  });
};

export default CustomFields;
