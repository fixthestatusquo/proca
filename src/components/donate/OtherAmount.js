import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { InputAdornment } from "@material-ui/core";
import TextField from "../TextField";

const OtherAmountInput = ({ form, classes, currency, setData }) => {
  const [otherAmountError, setOtherAmountError] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <TextField
        form={form}
        type="number"
        label={t("Amount")}
        name="amount"
        className={classes.number}
        error={!!otherAmountError}
        helperText={otherAmountError}
        onChange={(e) => {
          const a = parseFloat(e.target.value);
          if (a && a >= 1.0) {
            setData("amount", a);
            setOtherAmountError("");
          } else {
            setOtherAmountError(
              t("donation.belowMinimum", {
                currency: currency.symbol,
                amount: 1,
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
