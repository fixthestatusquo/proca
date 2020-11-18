import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Dialog from '../Dialog';
import Details from './Details';

export default function More (props) {
  const [open, setOpen] =useState(false);
  const { t } = useTranslation();
  const handleClick= (e) => {
    setOpen(true);
  };

  return <>
    <Dialog dialog={open} name={t("eci:common.head-title.home")}>
      <Details />
    </Dialog>
    <Button onClick={handleClick}>{t("eci:common.more_info")}</Button>
  </>;
};
