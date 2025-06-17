import React from "react";
//import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import MultiSelect from "@components/field/MultiSelect";
import SingleSelect from "@components/field/Select";
import { FormControl, FormLabel } from "@material-ui/core";

const Survey = ({ form }) => {
  const { i18n } = useTranslation();
  //  const config = useCampaignConfig();
  const questions = i18n.getResourceBundle(i18n.language, "campaign").questions;
  return Object.keys(questions).map(k => {
    if (questions[k].type === "single_select") {
      return (
        <FormControl component="fieldset" key={k}>
          <FormLabel component="legend">{questions[k].question}</FormLabel>

          <SingleSelect
            form={form}
            label=" "
            name={k}
            options={"campaign:questions." + k + ".options"}
            select="key"
          />
        </FormControl>
      );
    }

    return (
      <MultiSelect
        form={form}
        label={questions[k].question}
        name={k}
        options={questions[k].options}
        key={k}
      />
    );
  });
};

export default Survey;
