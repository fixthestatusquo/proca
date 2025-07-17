import React from "react";
//import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import MultiSelect from "@components/field/MultiSelect";
import SingleSelect from "@components/field/Select";
import { FormControl, FormLabel, Box, Button } from "@material-ui/core";
import TextField from "@components/TextField";

const Survey = ({ form, handleNext }) => {
  const { i18n } = useTranslation();
  //  const config = useCampaignConfig();
  const questions = i18n.getResourceBundle(i18n.language, "campaign").questions;
  return (<>

{Object.keys(questions).map(k => {
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

  if (questions[k].type === "input") {
          return (
            <FormControl component="fieldset" key={k} fullWidth margin="normal">
              <FormLabel component="legend">{questions[k].question}</FormLabel>
              <TextField
                form={form}
                name={k}
                multiline
                minRows={3}
                inputProps={{
                  maxLength: questions[k].max_length || 300,
                }}
                helperText={`${(form.watch(k) || "").length}/${questions[k].max_length || 300} characters`}
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
  })
}
        <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
       </Box>
</>)
};

export default Survey;
