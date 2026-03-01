import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { Controller } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";

import {
  FormHelperText,
  FormGroup,
  FormControl,
  FormControlLabel,
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  check: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    // For correct alignment with the text.
    verticalAlign: "middle",
    WebkitTapHighlightColor: "transparent",
    marginLeft: -11,
    marginRight: 16, // used for row presentation of radio/checkbox
    color: theme.palette.text.secondary,
    "& span": { fontSize: theme.typography.pxToRem(13) },
    //    "& :hover": { color: theme.palette.primary.main },
  },
}));

const ConfirmProcessing = props => {
  const {
    formState: { errors },
    control,
  } = props.form; // errors are in formState in React Hook Form 7
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const classes = useStyles();
  if (!config.component.consent?.confirmProcessing) return null;
  return (
    <FormControl error={!!(errors && errors.consentProcessing)}>
      <FormGroup>
        <FormControlLabel
          className={classes.check}
          placement="end"
          control={
            <Controller
              name="consentProcessing"
              control={control}
              defaultValue={false}
              rules={{ required: t(["consent.required", "required"]) }}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  color="primary"
                  onChange={e => field.onChange(e.target.checked)}
                  checked={field.value}
                />
              )}
            />
          }
          label={<ConsentProcessing checkboxLabel={true} />}
        />
        <FormHelperText>{errors.consentProcessing?.message}</FormHelperText>
      </FormGroup>
    </FormControl>
  );
};

export default ConfirmProcessing;
