import React, { useEffect, useState } from "react";
import { Grid, InputAdornment, IconButton } from "@mui/material";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import CancelIcon from "@mui/icons-material/Cancel";

const Salutation = (props) => {
  const { t } = useTranslation();
  const { setValue, watch } = props.form;

  let options = t("salutations", {
    returnObjects: true,
    defaultValues: [
      { m: "Dear {{name}}" },
      { f: "Dear {{name}}" },
      { other: "Dear {{name}}" },
    ],
  });
  const sal = watch("salutation") || "";
  const [open, setOpen] = useState(false);
  const { classField } = props.classes;

  useEffect(() => {
    if (sal === "") return;
    if (sal === "other") {
      setOpen(true);
    } else setOpen(false);
  }, [sal]);

  const width = () => {
    if (!props.compact) return 3;
    //    if (open) return 6;
    return 12;
  };

  const handleClick = () => {
    setOpen(false);
    setValue("salutation", "");
  };

  return (
    <>
      <Grid item xs={width()} sm={width()} className={classField}>
        <TextField
          hidden={open}
          select={!open}
          type={open ? "hidden" : undefined}
          name="salutation"
          label={t("Salutation")}
          form={props.form}
          SelectProps={{
            native: true,
          }}
        >
          <option key="empty" value=""></option>
          {Object.entries(options).map(([k, v]) => {
            return (
              <option key={k} value={k}>
                {v}
              </option>
            );
          })}
        </TextField>
        {open && ( // open
          <>
            <TextField
              name="salutation-other"
              label={options["other"]}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Cancel"
                      onClick={handleClick}
                      edge="end"
                      size="large">
                      <CancelIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoFocus
              form={props.form}
            />
          </>
        )}
      </Grid>
    </>
  );
};

export default Salutation;
