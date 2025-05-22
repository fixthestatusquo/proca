import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { Grid } from "@material-ui/core";
import { InputAdornment } from "@material-ui/core";
const AdditionalQuestion = ({classField,form}) => {
  return (
    <Grid item  className={classField}>
      <TextField
        form={form}
        name="critical_place"
label="Kritischer Ort"
  helperText="Welcher Ort oder welche Straße in deiner Stadt benötigt besonders dringend mehr kühlendes Grün?"
      />
    </Grid>
  );
}

export default AdditionalQuestion;
