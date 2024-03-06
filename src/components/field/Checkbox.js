import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormGroup,
  FormControl,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Controller } from "react-hook-form";

const useStyles = makeStyles((theme) => ({
  control: {
    marginTop: "0!important",
    marginBottom: "0!important",
  },
  check: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    // For correct alignment with the text.
    verticalAlign: "middle",
    WebkitTapHighlightColor: "transparent",
    marginLeft: -11,
    marginRight: 16, // used for row presentation of radio/checkbox
    "& span": { fontSize: theme.typography.pxToRem(13) },
  },
}));

const ProcaCheckbox = (props) => {
  const { control } = props.form;
  const classes = useStyles();
  const config = useCampaignConfig();

  //  const { t } = useTranslation();

  if (!props.name) return "you need to set ProcaCheckbox props.name";
  return (
    <FormControl
      className={classes.control + " " + (props.className || "proca-checkbox")}
    >
      <FormGroup>
        <FormControlLabel
          className={classes.check}
          placement="end"
          required={config.component.consent.bcc}
          control={
            <Controller
              name={props.name}
              control={control}
              render={({ field }) => (
                <Checkbox {...field} color="primary" checked={field.value} />
              )}
            />
          }
          label={props.label}
        />
      </FormGroup>
    </FormControl>
  );
};

export default ProcaCheckbox;
