import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "./hooks/useEciTranslation";

import TTag from "@components/TTag";
import Dialog from "@components/Dialog";
import More from "@components/eci/More";
 const ReadMore = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog
        dialog={open}
        close={handleClose}
        name={t("eci:common.head-title.home")}
      >
        <h1>{t("campaign:title")}</h1>
        <TTag message="campaign:description" />
        <More />
      </Dialog>
      <Button variant="contained" onClick={handleClick}>
        {t("eci:howsupport.s1_text")}
      </Button>
    </>
  );
}

export default ReadMore;