import React from "react";
import { Grid } from "@material-ui/core";
import Select from "./Select";

const Gender = ({ form, compact, classField }) => {
  const genders = { male: "♂", female: "♀" };
  const width = () => (!compact ? 2 : 12);

  return (
    <Grid item xs={width()} sm={width()} className={classField}>
      <Select
        name="gender"
        label="⚧"
        select="key"
        form={form}
        options={genders}
      />
    </Grid>
  );
};

export default Gender;
