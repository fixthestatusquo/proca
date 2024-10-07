import React from "react";

import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
//import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from "@material-ui/core/ListItemText";
//import Divider from '@material-ui/core/Divider';
import FileIcon from "@material-ui/icons/Description";

export default function Details() {
  const config = useCampaignConfig();
  const eci = Object.assign({}, config.component.eci);
  const { t } = useTranslation();
  const r = /ECI\((.*?)\)([0-9]+)/g.exec(eci.registrationNumber);
  eci.registrationUrl = r
    ? `https://europa.eu/citizens-initiative/initiatives/details/${r[1]}/${r[2]}_${config.lang}`
    : "";
  eci.apiUrl = eci.apiUrl.replace("/api", "");
  return (
    <>
      <h4 id="eci-details">{t("eci:form.title")}</h4>
      <List component="nav">
        <ListItem>
          <ListItemText
            secondary={eci.registrationDate}
            primary={t("eci:header.registration_date")}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            secondary={eci.registrationNumber}
            primary={t("eci:header.registration_number")}
          />
        </ListItem>
        <ListItem
          button
          component="a"
          target="_blank"
          href={`${eci.apiUrl}/d/certification.pdf`}
        >
          <ListItemText
            secondary={<FileIcon />}
            primary={t("eci:footer.conformity-title")}
          />
        </ListItem>
        {eci.registrationUrl && (
          <ListItem
            button
            component="a"
            target="_blank"
            href={eci.registrationUrl}
          >
            <ListItemText
              secondary={eci.registrationUrl}
              primary={t("eci:initiative.register_webpage")}
            />
          </ListItem>
        )}
        <ListItem>
          <ListItemText
            primary={t("eci:initiative.representative")}
            secondary={eci.organisers.map(o => {
              return o.familyName
                ? `${o.firstName} ${o.familyName}  `
                : o.firstName;
            })}
          />
        </ListItem>
      </List>
    </>
  );
}
