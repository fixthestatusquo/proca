import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "./hooks/useEciTranslation";

import Dialog from "@components/Dialog";
import Details from "./Details";

export default function More() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Dialog
        dialog={open}
        close={() => setOpen(false)}
        name={t("eci:common.head-title.home")}
      >
        <Details />
      </Dialog>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {t("eci:common.more_info")}
      </Button>
    </>
  );
}
