import React from "react";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
//import Avatar from "@material-ui/core/Avatar";
import { Grid, Avatar } from "@material-ui/core";
//import Badge from "@material-ui/core/Badge";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

const useStyles = makeStyles((theme) => ({
  badge: {
    margin: theme.spacing(0.5),
    border: "none",
    background: theme.palette.action.disabledBackground,
    borderColor: theme.palette.primary.main,
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    "&.Mui-disabled": {
      opacity: "0.3",
      borderColor: theme.palette.action.disabledBackground,
      background: theme.palette.action.disabledBackground,
    },
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
    "& .proca-MuiAvatar-root": {
      height: "24px",
      width: "24px",
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

const FilterBelgium = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [constituency, setConstituency] = props.constituencyState;
  const [votations, setVotations] = props.votationState;
  const toggles = ["eu", "federal", "bru", "vl", "wal"];
  let selected = [];
  let enabled = [];

  Object.entries(votations).forEach(([name, votation]) => {
    switch (name) {
      case "europe":
        votation.selected && selected.push("eu");
        constituency && enabled.push("eu");
        break;
      case "state":
        votation.selected && selected.push("federal");
        constituency && enabled.push("federal");
        break;
      case "region": {
        if (!constituency) return;
        const _constituency = constituency.substr(0, 3);
        votation.selected && selected.push(_constituency);
        enabled.push(_constituency);
        break;
      }
    }
  });

  console.log(props.constituency, selected, enabled);

  const toggle = (name) => {
    const toggle2votation = {
      eu: "europe",
      federal: "state",
      wal: "region",
      vl: "region",
      bru: "region",
    };
    name = toggle2votation[name];
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
      <Grid item xs={12} sm={6}>
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
            Brussels (nederlandstalig)
          </option>
          <option value="bru_fr" key="bru_fr">
            Bruxelles (francophone)
          </option>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} className={classes.root}>
        <ToggleButtonGroup size="small" value={selected}>
          {toggles.map((name) => (
            <ToggleButton
              aria-label={name}
              key={name}
              onClick={() => toggle(name)}
              value={name}
              disabled={!enabled.includes(name)}
              className={classes.badge}
            >
              <Avatar
                alt={name}
                src={"https://static.proca.app/ep2024/images/" + name + ".png"}
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
  //return "your region + level"
};

export default FilterBelgium;
