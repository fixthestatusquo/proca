import React, { useEffect } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
//import useData from "@hooks/useData";
import TextField from "@components/TextField";
import { Grid } from "@material-ui/core";
import { InputAdornment } from "@material-ui/core";
import useData from "@hooks/useData";
import EcoIcon from "@material-ui/icons/Eco";
//import useToken from "@hooks/useToken";

const AdditionalQuestion = ({ classField, form, handleBeforeSubmit }) => {
  const [data, setData] = useData();
  const original = data._copyMessage;
  const place = form.watch("place");

  const cleanData = (data) => {
    delete data._copyMessage;
    delete data.message_male;
    delete data.message_female;
    
    console.log("clean data",data); 
    return data;
}
 
  handleBeforeSubmit (cleanData);
  //  const handleMerging = text => {setData("message", text);};

  useEffect(() => {
    if (!data.message || original) return;
    setData("_copyMessage", data.message);
    console.log("original set");
  }, [data.message, original]);

  //useToken(original, {custom:{location:place}}, handleMerging);

  useEffect(() => {
    if (!original) return;
    if (!place) return;

    setData(
      "message",
      original.replace(
        "{{custom.location}}",
        "Dieser Ort in unserer Stadt benötigt besonders dringend mehr kühlendes Grün: " +
          place
      )
    );
  }, [place, original]);

  return (
    <Grid item className={classField}>
      <TextField
        form={form}
        name="place"
        label="Dein Wunschort für mehr Grün"
        helperText="Welcher Ort oder welche Straße in deiner Stadt benötigt besonders dringend mehr kühlendes Grün?"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <EcoIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );
};

export default AdditionalQuestion;
