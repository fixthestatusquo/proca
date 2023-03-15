import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import TwitterAction from "./Action";
import { useTranslation } from "react-i18next";
import { getCountryName } from "@lib/i18n";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    overflow: "auto",
    maxHeight: 300,
  },
}));

const TwitterList = (props) => {
  const { t } = useTranslation();
  const { getValues } = props.form;
  const classes = useStyles();
  if (!props.profiles || props.profiles.length === 0) {
    const country = getValues("country") || "";
    return (
      <Alert severity="warning">
        {t("target.country.empty", {
          country: getCountryName(country),
        })}
      </Alert>
    );
  }
  return (
    <List className={classes.root}>
      {props.profiles.map((d) => (
        <TwitterAction
          clickable={props.clickable}
          form={props.form}
          key={d.procaid}
          actionPage={props.actionPage}
          done={props.done}
          actionUrl={props.actionUrl}
          {...d}
        ></TwitterAction>
      ))}
    </List>
  );
};

export default TwitterList;
