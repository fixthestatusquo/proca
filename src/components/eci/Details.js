import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import {useCampaignConfig} from '../../hooks/useConfig';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

export default function Details (props) {
  const config = useCampaignConfig();
  const eci = config.component.eci;
  const { t } = useTranslation();
  console.log(eci);

  return <>
          <List component="nav" aria-label="main mailbox folders">
        <ListItem>
          <ListItemText secondary={eci.registrationDate} primary={t("eci:header.registration_date")}/>
    </ListItem>
        <ListItem>
          <ListItemText secondary={eci.registrationNumber} primary={t("eci:header.registration_number")}/>
    </ListItem>
        <ListItem>
          <ListItemText secondary={eci.registrationNumber} primary={t("eci:footer.conformity-title")}/>
    </ListItem>
        <ListItem>
          <ListItemText secondary={eci.registrationNumber} primary={t("eci:initiative.register_webpage")}/>
    </ListItem>
    <ListItem>
    <ListItemText primary={t("eci:initiative.representative")} secondary=
      {eci.organisers.map( (o,i) =>{
        return o.familyName? o.firstName + " " + o.familyName + "  ": o.firstName;
      })}
    /></ListItem>
    </List>
  </>;
};
