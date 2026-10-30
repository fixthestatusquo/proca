import React from "react";
import { targetStore, useTargets } from "@hooks/useTargets";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Chip from "@material-ui/core/Chip";
import FormHelperText from "@material-ui/core/FormHelperText";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import RemoveIcon from "@material-ui/icons/RemoveCircle";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  badge: {
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

const PartyFilter = props => {
  const classes = useStyles();
  const { allowed, select, setFilter } = useTargets();
  const [groups, setGroups] = useState(() => new Set());
  const [parties, setParties] = useState({});
  const [allParties, setAllParties] = useState({});
  const getKey = useMemo(
    () => props.getKey || (d => d.description),
    [props.getKey]
  );
  const country = (
    props.country || props.form?.watch("country")
  )?.toLowerCase();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async url => {
      const res = await fetch(url);
      if (!res.ok) throw res.statusText;

      const d = await res.json();
      const list = d.reduce((map, obj) => {
        const key = `${obj.country.toUpperCase()}:${obj.party}`;
        map[key] = obj;
        return map;
      }, {});
      setAllParties(list);
    };
    fetchData("https://widget.proca.app/t/ep-parties.json");
  }, []);

  useEffect(() => {
    if (!country || !allowed.length) return;
    const count = {};
    const list = allowed.filter(d => !country || d.country === country);
    for (const item of list) {
      const key = getKey(item);
      if (count[key]) {
        count[key].count++;
      } else {
        count[key] = { count: 1, eugroup: item.eugroup };
      }
    }

    const groupOrder = [
      "GUE/NGL",
      "Greens/EFA",
      "S&D",
      "Renew",
      "EPP",
      "ECR",
      "Patriots",
      "ESN",
      "NA",
    ];

    const sortedObject = Object.fromEntries(
      [...Object.entries(count)].sort(([a, ae], [b, be]) => {
        if (ae.eugroup === be.eugroup) return a.localeCompare(b);
        return groupOrder.indexOf(ae.eugroup) > groupOrder.indexOf(be.eugroup);
      })
    );
    setParties(sortedObject);
  }, [allowed, country, getKey]);

  useEffect(
    () => () => {
      setFilter("party", null);
    },
    [setFilter]
  );

  const toggle = name => {
    const next = new Set(groups);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setGroups(next);

    const ids = allowed
      .filter(target => getKey(target) === name)
      .map(target => target.procaid);

    if (next.size === 0) {
      // no party selected: show everything, but keep manual checks
      setFilter("party", null);
      select(previous => previous.filter(id => !ids.includes(id)));
      return;
    }

    setFilter("party", {
      display: target =>
        next.has(getKey(target)) ||
        targetStore.getState().selected.includes(target.procaid),
    });

    if (next.has(name)) {
      // checking: select the party's targets, keep existing checks
      select(previous => [...new Set([...previous, ...ids])]);
    } else {
      // unchecking: hide and uncheck this party's targets
      select(previous => previous.filter(id => !ids.includes(id)));
    }
  };

  return (
    <>
      <div className={classes.root}>
        {Object.entries(parties).map(([name, party]) => {
          const record = allParties[`${country?.toUpperCase()}:${name}`] || {
            name: name,
          };
          const AvatarParty = record.picture && (
            <Avatar alt={name} src={record.picture} />
          );
          const checked = groups.has(name);
          return (
            <Badge
              key={name}
              badgeContent={party.count}
              color="default"
              overlap="rectangular"
              className={classes.badge}
              invisible={party.count < 2}
            >
              <Chip
                title={name}
                label={record.acronym || name}
                clickable
                avatar={AvatarParty}
                color={checked ? "primary" : "default"}
                onClick={() => toggle(name)}
                onDelete={() => toggle(name)}
                deleteIcon={checked ? <RemoveIcon /> : <AddIcon />}
              />
            </Badge>
          );
        })}
      </div>
      {Object.entries(parties).length > 0 && (
        <FormHelperText component="div" style={{ margin: 3 }}>
          {t("party_helper")}
        </FormHelperText>
      )}
    </>
  );
};

export default PartyFilter;
