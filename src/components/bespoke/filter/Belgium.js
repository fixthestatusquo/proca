import React, { useState } from "react";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import Badge from "@material-ui/core/Badge";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import RemoveIcon from "@material-ui/icons/RemoveCircle";

const useStyles = makeStyles((theme) => ({
  votation: {
    marginBottom: theme.spacing(1),
  },
  badge: {
    "& .proca-MuiBadge-badge": {
      top: theme.spacing(0.5),
      height: "12px",
      padding: "0 2px",
      minWidth: "12px",
      right: theme.spacing(1),
      border: "1px solid " + theme.palette.action.disabledBackground,
      background: theme.palette.action.disabledBackground,
    },
  },
  root: {
    display: "flex",
    justifyContent: "left",
    flexWrap: "wrap",
    "& > *": {
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
  },
}));

const FilterBelgium = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [votation, setVotation] = useState({});

  const toggle = () => {
    console.log("toggle");
  };
  return (
    <>
      <TextField
        select
        name="circonscription"
        label={t("Circoncription")}
        form={props.form}
        onChange={(e) => {}}
        SelectProps={{
          native: true,
        }}
      >
        <option value="" key=""></option>
        <option value="vl" key="vl">
          Vlaanderen
        </option>
        <option value="wal" key="wal">
          Wallonie
        </option>
        <option value="bru" key="bru">
          Brussels/Bruxelles
        </option>
      </TextField>
      <div className={classes.votation}>
        <Chip
          title="Region"
          label="Region"
          clickable
          color={votation.selected ? "primary" : "default"}
          onClick={() => toggle(name)}
          onDelete={() => toggle(name)}
          deleteIcon={votation.selected ? <RemoveIcon /> : <AddIcon />}
        />
        <Chip
          title="Federal"
          label="Federal"
          clickable
          color={votation.selected ? "primary" : "default"}
          onClick={() => toggle(name)}
          onDelete={() => toggle(name)}
          deleteIcon={votation.selected ? <RemoveIcon /> : <AddIcon />}
        />
        <Chip
          title="European"
          label="European"
          clickable
          color={votation.selected ? "primary" : "default"}
          onClick={() => toggle(name)}
          onDelete={() => toggle(name)}
          deleteIcon={votation.selected ? <RemoveIcon /> : <AddIcon />}
        />
      </div>
    </>
  );
  //return "your region + level"
};

export default FilterBelgium;
