import React from "react";
import TextField from "@components/field/TextField";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
//import Avatar from "@material-ui/core/Avatar";
import { Grid, Avatar } from "@material-ui/core";
//import Badge from "@material-ui/core/Badge";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles(theme => ({
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
      border: `1px solid ${theme.palette.action.disabledBackground}`,
      background: theme.palette.action.disabledBackground,
    },
  },
  divider: {
    margin: theme.spacing(1, 0.5),
  },
  root: {
    display: "flex",
    ajustifyContent: "left",
    flexWrap: "wrap",
    marginTop: theme.spacing(0.5),
    "& > *": {
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
  },
}));

const FilterBelgium = props => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const classes = useStyles();
  const [constituency, setConstituency] = props.constituencyState;
  const [votations, setVotations] = props.votationState;
  const togglesA = ["eu", "federal"];
  const togglesB = ["bru", "vl", "wal"];
  const selected = [];
  const enabled = [];
  //  const hideConstituency = config.locale !== "en";
  const hideConstituency = false;

  if (hideConstituency) {
    enabled.push("bru");
    if (config.locale === "fr") enabled.push("wal");
    if (config.locale === "nl") enabled.push("vl");
  }
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

  const toggle = name => {
    const toggle2votation = {
      eu: "europe",
      federal: "state",
      wal: "region",
      vl: "region",
      bru: "region",
    };
    const vname = toggle2votation[name];
    let selected = undefined;
    setVotations(prevVotation => {
      selected = prevVotation[vname].selected;
      if (
        selected &&
        hideConstituency &&
        vname === "region" &&
        name !== constituency.substr(0, 3)
      ) {
        return prevVotation; // no change selection, but button changes
      }
      selected = true;
      return {
        ...prevVotation,
        [vname]: {
          ...prevVotation[vname],
          selected: !prevVotation[vname].selected,
        },
      };
    });
    if (hideConstituency) {
      if (constituency === "vl" && name === "bru" && selected) {
        setConstituency("bru_nl");
      }
      if (constituency === "bru_nl" && name === "vl" && selected) {
        setConstituency("vl");
      }
      if (constituency === "bru_fr" && name === "wal" && selected) {
        setConstituency("wal");
      }
      if (constituency === "wal" && name === "bru" && selected) {
        setConstituency("bru_fr");
      }
    }
  };

  return (
    <Grid container spacing={1} alignItems="center">
      {!hideConstituency && (
        <Grid item xs={12} sm={6}>
          <TextField
            select
            name="constituency"
            label={t("Constituency")}
            required
            form={props.form}
            onChange={e => {
              setConstituency(e.target.value);
            }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="" key="" />
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
      )}
      <Grid
        item
        xs={12}
        sm={hideConstituency ? 12 : 6}
        className={classes.root}
      >
        <ToggleButtonGroup
          size={hideConstituency ? "normal" : "small"}
          value={selected}
        >
          {togglesA.map(name => (
            <ToggleButton
              aria-label={name}
              title={name}
              key={name}
              onClick={() => toggle(name)}
              value={name}
              disabled={!enabled.includes(name)}
              className={classes.badge}
            >
              <Avatar
                alt={name}
                src={`https://static.proca.app/ep2024/images/${name}.png`}
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Divider flexItem orientation="vertical" className={classes.divider} />
        <ToggleButtonGroup
          size={hideConstituency ? "normal" : "small"}
          value={selected}
        >
          {togglesB.map(name => (
            <ToggleButton
              title={name}
              aria-label={name}
              key={name}
              onClick={() => toggle(name)}
              value={name}
              disabled={!enabled.includes(name)}
              className={classes.badge}
            >
              <Avatar
                alt={name}
                src={`https://static.proca.app/ep2024/images/${name}.png`}
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
