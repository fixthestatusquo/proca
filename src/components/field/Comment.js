import React, {useState} from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { InputAdornment } from "@material-ui/core";
import Salutation from "@components/field/Gender";
import { Grid, Button, CircularProgress } from "@material-ui/core";
import TextField from "@components/TextField";

const Comment = ({ form, compact, classes, classField, enforceRequired }) => {
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);
  const config = useCampaignConfig();
const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

const fetchData = async () => {
setIsLoading(true);
    const isValid = await form.trigger("firstname"); // Returns true/false
    if (!isValid) 
      return
const formData = form.getValues(); 
  delete formData.last_name;
  delete formData.email;
  delete formData.phone_number;
  delete formData.postal_code;
  delete formData.comment;

console.log(formData);
  try {
    const response = await fetch("https://snowflaike.proca.app/"+config.campaign.name,
{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), 
      });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json(); // Parse JSON response
console.log(data);
    form.setValue("comment", data.response);
  } catch (error) {
    console.error("Fetch error:", error);
    setValue("comment", "Failed to load the message");
    } finally {
      setIsLoading(false); // Stop loading (runs even if error occurs)
    }
};

  return (
    <>
                <Grid item xs={12} className={classField}>
                  <TextField
                    form={form}
                    name="comment"
                    multiline
                    maxRows="10"
                    required={
                      enforceRequired &&
                      config.component.register?.field?.comment?.required
                    }
                    label={t("Comment")}
                    helperText={t("help.comment", "")}
                  />
                </Grid>
                <Grid item xs={12} className={classField}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchData} 
            disabled={isLoading} 
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Help me write the message
          </Button>
                </Grid>
    </>
  );
};

export default Comment;
