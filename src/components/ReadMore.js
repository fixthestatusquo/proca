import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "./eci/hooks/useEciTranslation";

import TTag from "@components/TTag";
import Dialog from "@components/Dialog";
import T from "@components/T";
import More  from "@components/eci/More";
export default function ReadMore(props) {
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
        <T props={{ message: props.title }}/>
        <TTag props={{ message: props.message }} />
        <More />
      </Dialog>
      <Button variant="contained" onClick={handleClick}>
        {t("eci:common.read_more")}
      </Button>
    </>
  );
}
