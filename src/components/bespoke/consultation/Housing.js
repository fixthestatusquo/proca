import React from 'react';
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import MultiSelect from "@components/field/MultiSelect";

const Survey = ({form}) => {
  const { i18n } = useTranslation();
  const config = useCampaignConfig();
console.log(i18n.language, form);
  const questions = i18n.getResourceBundle(i18n.language, 'campaign').questions;
  return Object.keys (questions).map (k => <MultiSelect form={form} label={questions[k].question} name={k} options={questions[k].options} key={k}/>)
}

export default Survey;
