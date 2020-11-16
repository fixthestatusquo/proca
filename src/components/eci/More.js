import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Dialog from '../Dialog';
import {useCampaignConfig} from '../../hooks/useConfig';
import Details from './Details';

export default function More (props) {
  const [open, setOpen] =useState(false);
  const config = useCampaignConfig();
  const eci = config.component.eci;
  const { t } = useTranslation();
  console.log(eci);
  const handleClick= (e) => {
    setOpen(true);
  };

  return <>
    <Dialog dialog={open} name={t("eci:head-title.home")}>
      <Details />
    </Dialog>
    <Button onClick={handleClick}>More</Button>
  </>;
};
