import React, { useEffect, useState } from 'react';
import { Grid } from "@material-ui/core";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";

const Salutation = (props) => {
  const { t } = useTranslation();
  const { setValue, watch } = props.form;
  const options = Object.values(t('salutations', { returnObjects: true }));
  const sal = watch("salutation") || "";
  const [open, setOpen] = useState(false);
  const { classField } = props.classes;

  useEffect(() => {
    if (sal === options[options.length-1]) {
      setOpen(true);
    } else
      setOpen(false);
  }, [sal, options]);

  return (
    <>
       <Grid item xs={12} sm={props.compact ? 12 : 6} className={classField}>
      <TextField
        select
        name="salutation"
        label={t("Salutation")}
        form={props.form}
        SelectProps={{
          native: true,
        }}
    >
      <option key="empty" value=""></option>
      {options.map(option => {
        return (<option key={option} value={option}>
                   {option}
        </option>)
      })}
      </TextField>
      </Grid>
      <Grid item xs={12} sm={props.compact ? 12 : 6} className={classField}>
      {open && <TextField
        name="salutation-other"
        label={t('Other')}
        form={props.form}
      >
        </TextField>}
        </Grid>
    </>
  );
};

export default Salutation;