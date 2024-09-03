import React, { useState } from "react";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import Twitter from "@components/field/Twitter"
import Checkbox from "@components/field/Checkbox";
import { FormGroup, FormControl, FormLabel, Box, Grid } from "@material-ui/core";

const EggManifesto = (props) => {
  const hasOrganisation = props.form.watch("has-organisation");

  return (
    <Grid container alignItems="flex-start">
      <Grid item xs={12}>
        {/* <FormControl component="fieldset"> */}
        {/* <FormLabel component="legend">As Institution</FormLabel> */}
        <Box border={1} borderRadius={4} padding={2} marginTop={1}>
        <Checkbox
          name="has-organisation"
          label="Signing as an institution"
          form={props.form}
          />
          <FormGroup>
          {hasOrganisation && <>
            <Twitter form={props.form} />
            <TextField
              label="The name of the institution"
              form={props.form}
              name="Twitter-name"
            />
            </>
          }
          </FormGroup>
          {/* </FormControl> */}
        </Box>
      </Grid>
    </Grid>
  )
}

export default EggManifesto;
