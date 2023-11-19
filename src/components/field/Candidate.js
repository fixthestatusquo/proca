import React, { useEffect, useState } from "react";
import { Grid, InputAdornment, IconButton } from "@material-ui/core";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import CancelIcon from "@material-ui/icons/Cancel";
import Country from "./Country";
import Autocomplete from "@material-ui/lab/Autocomplete";

const Affiliation = (props) => {
  const { t } = useTranslation();
  const { setValue, watch } = props.form;

  let options = [
    { code: 1, name: "Example Party" },
    { code: 2, name: "United together" },
    { code: "other", name: "Another party" },
  ];
  const sal = watch("affiliation") || "";
  const [open, setOpen] = useState(false);
  const { classField } = props.classes;

  useEffect(() => {
    if (sal === "") return;
    if (sal === "other") {
      setOpen(true);
    } else setOpen(false);
  }, [sal]);

  const width = () => {
    return 12;
  };

  const handleClick = () => {
    setOpen(false);
    setValue("affiliation", "");
  };

  return (
    <>
      <Grid item xs={12}>
        <Country form={props.form} required />
      </Grid>
      <Grid item xs={width()} sm={width()} className={classField}>
        <TextField
          hidden={open}
          select={!open}
          type={open ? "hidden" : undefined}
          name="affiliation"
          required
          label={t("Party")}
          form={props.form}
          SelectProps={{
            native: true,
          }}
        >
          <option key="empty" value=""></option>
          {options.map((d) => {
            return (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            );
          })}
        </TextField>
        {open && ( // open
          <>
            <TextField
              name="affiliation-other"
              label={options["other"]}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Cancel"
                      onClick={handleClick}
                      edge="end"
                    >
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

export default Affiliation;
