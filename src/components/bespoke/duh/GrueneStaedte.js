import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { Grid } from "@material-ui/core";
import { InputAdornment } from "@material-ui/core";
import useData from "@hooks/useData";
import EcoIcon from '@material-ui/icons/Eco';

const AdditionalQuestion = ({classField,form}) => {
  return (
    <Grid item  className={classField}>
      <TextField
        form={form}
        name="critical_place"
label="Kritischer Ort"
  helperText="Welcher Ort oder welche Straße in deiner Stadt benötigt besonders dringend mehr kühlendes Grün?"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
                <EcoIcon color="action"/>
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );
}

export default AdditionalQuestion;
