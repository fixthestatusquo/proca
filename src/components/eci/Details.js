import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Dialog from '../Dialog';

export default function Details (props) {
  const [open, setOpen] =useState(false);
  const { t } = useTranslation();


  return <>
    <Dialog open={open}>More</Dialog>
    <Button onClick={setOpen(true)}>{t("eci:More")}</Button>
    </>;
};
