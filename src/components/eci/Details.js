import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Dialog from '../Dialog';
import {useCampaignConfig} from '../../hooks/useConfig';

export default function Details (props) {
  const [open, setOpen] =useState(false);
  const config = useCampaignConfig();
  const eci = config.component.eci;
  const { t } = useTranslation();
  console.log(eci);
  const handleClick= (e) => {
    setOpen(true);
  };

  return <>
    <Dialog dialog={open}>
      {eci.registrationDate}<br/>
      {eci.registrationNumber}<br/>
      {eci.organisers.map( (o,i) =>{

        return o.familyName? o.firstName + " " + o.familyName + "  ": o.firstName;
      })}
    </Dialog>
    <Button onClick={handleClick}>More</Button>
  </>;
};
