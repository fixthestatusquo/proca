import React from "react";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
//import Avatar from "@material-ui/core/Avatar";
import { Chip, Grid, Avatar } from "@material-ui/core";
//import Badge from "@material-ui/core/Badge";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import RemoveIcon from "@material-ui/icons/RemoveCircle";

const useStyles = makeStyles((theme) => ({
  badge: {
    "& .proca-MuiAvatar-root": {
      height: "24px",
      width: "24px",
      left: theme.spacing(0.5),
      border: "1px solid " + theme.palette.action.disabledBackground,
    },
    "& .proca-MuiAvatar-img": {
      height: "24px",
      width: "24px",
      background: "white",
    },
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
    adisplay: "flex",
    ajustifyContent: "left",
    flexWrap: "wrap",
    marginTop: theme.spacing(0.5),
    "& > *": {
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
  },
}));

const AvatarIcon = (props) => {
  /*
      icon: 'https://static.proca.app/ep2024/images/wal.png';
import FlanderIcon from '@components/bespoke/ep2024/images/vl.png';
import EUIcon from '@components/bespoke/ep2024/images/eu.png';
import BEIcon from '@components/bespoke/ep2024/images/be.png';
import WalloniaIcon from '@components/bespoke/ep2024/images/wal.png';
import FlanderIcon from '@components/bespoke/ep2024/images/vl.png';
*/
  let url = "https://static.proca.app/ep2024/images/";
  console.log(props.name);
  switch (props.name) {
    case "europe":
      url += "eu.png";
      break;
    case "state":
      url += "federal.png";
      break;
    case "region":
      console.log(props.constituency);

      switch (props.constituency) {
        case "wal":
          url += "wal.png";
          break;
        case "vl":
          url += "vl.png";
          break;
        case "bru_nl":
          url += "bru.png";
          break;
        case "bru_fr":
          url += "bru.png";
          break;
        default:
          return null;
      }
      break;
    default:
      url += "be.png";
  }
  return <Avatar alt={name} src={url} />;
};

const FilterBelgium = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [constituency, setConstituency] = props.constituencyState;
  const [votations, setVotations] = props.votationState;

  const toggle = (name) => {
    setVotations((prevVotation) => ({
      ...prevVotation,
      [name]: {
        ...prevVotation[name],
        selected: !prevVotation[name].selected,
      },
    }));
  };

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={12} sm={7}>
        <TextField
          select
          name="constituency"
          label={t("Constituency")}
          required
          form={props.form}
          onChange={(e) => {
            setConstituency(e.target.value);
          }}
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
          <option value="bru_nl" key="bru_nl">
            Brussels
          </option>
          <option value="bru_fr" key="bru_fr">
            Bruxelles
          </option>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={5} className={classes.root}>
        {Object.entries(votations).map(([name, votation]) => (
          <Chip
            className={classes.badge}
            label={votation.label}
            key={name}
            clickable
            avatar={<AvatarIcon name={name} constituency={constituency} />}
            color={votation.selected ? "primary" : "default"}
            onClick={() => toggle(name)}
            onDelete={() => toggle(name)}
            deleteIcon={votation.selected ? <RemoveIcon /> : <AddIcon />}
          />
        ))}
      </Grid>
    </Grid>
  );
  //return "your region + level"
};

export default FilterBelgium;
