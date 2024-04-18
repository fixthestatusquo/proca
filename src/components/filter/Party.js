import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import Badge from "@material-ui/core/Badge";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import RemoveIcon from "@material-ui/icons/RemoveCircle";

const useStyles = makeStyles((theme) => ({
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

const PartyFilter = (props) => {
  const classes = useStyles();
  const [parties, _setParties] = useState({});
  const [allParties, setAllParties] = useState({});
  const getKey = props.getKey || ((d) => d.description);
  const country = props.country?.toLowerCase();
  const filterCountry = props.filterCountry || ((d) => d.country === country);

  const url = "https://static.proca.app/ep2024/parties.json";

  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.statusText;

      const d = await res.json();
      const allParties = d.reduce((map, obj) => {
        const key = `${obj.country}:${obj.party}`;
        map[key] = obj;
        return map;
      }, {});
      setAllParties(allParties);
    };
    fetchData(url);
  }, [url, setAllParties]);

  const setParties = (fullList) => {
    if (fullList.length) {
      const count = {};
      let list = fullList;
      if (props.country) {
        list = fullList.filter(filterCountry);
      }
      for (const item of list) {
        const key = getKey(item);
        if (count[key]) {
          count[key].count++;
        } else {
          count[key] = { count: 1, selected: false };
        }
      }

      //list.foreach
      const sortedObject = Object.fromEntries(
        [...Object.entries(count)].sort(([a], [b]) => a.localeCompare(b)),
      );

      _setParties(sortedObject);
      //return list[0];
    }
  };

  const toggle = (name) => {
    _setParties((prevParties) => ({
      ...prevParties,
      [name]: {
        ...prevParties[name],
        selected: !prevParties[name].selected,
      },
    }));
    props.selecting(() => ({
      filter: "description",
      key: name,
      value: !parties[name].selected,
      reset: false,
    }));
  };

  /*  useEffect(() => {
    if (!parties) return;
    console.log("filtering", Object.keys(parties).length);
    props.selecting(filter);
  }, [parties]);
*/

  useEffect(() => {
    if (props.getKey) {
      console.log("filter", props);
    }
    if (!props.country) return;
    props.selecting(setParties); // we're not selecting, just using that to get the parties from the contacts
  }, [props.selecting, props.country]);

  //avatar={<Avatar>{party.count}</Avatar>}

  if (parties) {
    return (
      <div className={classes.root}>
        {Object.entries(parties).map(([name, party]) => {
          const record = allParties[props.country + ":" + name] || {
            name: name,
          };
          const AvatarParty = record.picture && (
            <Avatar alt={name} src={record.picture} />
          );
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
                color={party.selected ? "primary" : "default"}
                onClick={() => toggle(name)}
                onDelete={() => toggle(name)}
                deleteIcon={party.selected ? <RemoveIcon /> : <AddIcon />}
              />
            </Badge>
          );
        })}
      </div>
    );
  }
  return null;
};

export default PartyFilter;
