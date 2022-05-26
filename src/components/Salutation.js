import React, { useEffect, useState } from 'react';
import { Grid } from "@material-ui/core";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";

const Salutation = (props) => {
  const { t } = useTranslation();
  const { setValue, watch } = props.form;
  const options = Object.values(t('salutations', { returnObjects: true }));
  const sal = watch("salutation") || "";
  const other = watch("salutation-other") || "";
  const [open, setOpen] = useState(false);
  console.log("other", other);
  const { classField } = props.classes;

  useEffect(() => {
    if (sal === options[options.length-1]) {
      setOpen(true);
    } else
      setOpen(false);
  }, [sal, options]);

  console.log("sal", sal);

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
        onChange={(e) => {
          setValue("salutation", e.target.value);
        }
        }

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
        onChange={(e) => {
          setValue("salutation-other", e.target.value);
        }
        }
      >
        </TextField>}
        </Grid>
    </>
  );
};

export default Salutation;