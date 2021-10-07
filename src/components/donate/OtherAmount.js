import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { FormHelperText, Grid, InputAdornment } from "@material-ui/core";
import TextField from "../TextField";

const OtherAmountInput = ({ form, classes, currency, setData }) => {
  const [otherAmountError, setOtherAmountError] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      {otherAmountError ? (
        <Grid item xs={12}>
          <FormHelperText error={true}>{otherAmountError}</FormHelperText>
        </Grid>
      ) : (
        ""
      )}
      <TextField
        form={form}
        type="number"
        label={t("Amount")}
        name="amount"
        className={classes.number}
        onChange={(e) => {
          const a = parseFloat(e.target.value);
          if (a && a > 1.0) {
            setData("amount", a);
            setOtherAmountError("");
          } else {
            setOtherAmountError(
              t("Please enter a valid amount greater than 1.0 {{currency}}", {
                currency: currency.symbol,
              })
            );
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">{currency.symbol}</InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true }}
      />
    </>
  );
};

export default OtherAmountInput;
