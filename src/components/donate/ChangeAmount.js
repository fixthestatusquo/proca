import React from "react";

import { Grid, Button } from "@material-ui/core";
import BackspaceIcon from "@material-ui/icons/Backspace";

import { useTranslation } from "react-i18next";
import { goStep } from "../../hooks/useConfig";
export default function ChangeAmount(props) {
  const { t } = useTranslation();

  return (
    <Grid container justify="flex-end">
      <Button
        endIcon={<BackspaceIcon />}
        onClick={() => goStep("donate_Amount")}
        color="secondary"
      >
        {t("Change amount")}
      </Button>
    </Grid>
  );
}
