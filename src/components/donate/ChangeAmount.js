import React from "react";

import { Grid, Button, Box } from "@mui/material";
import BackspaceIcon from "@mui/icons-material/Backspace";

import { useTranslation } from "react-i18next";
import { goStep } from "@hooks/useConfig";
export default function ChangeAmount() {
  const { t } = useTranslation();

  return (
    <Box mt={3}>
      <Grid container justifyContent="flex-end" spacing={2}>
        <Button
          endIcon={<BackspaceIcon />}
          onClick={() => goStep("donate_Amount")}
          color="secondary"
        >
          {t("donation.amount.change")}
        </Button>
      </Grid>
    </Box>
  );
}
