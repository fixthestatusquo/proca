import React, { useEffect, useState } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Country from "@components/field/Country";
import { useForm } from "react-hook-form";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexFlow: "column wrap",
    gap: "0 0px",
    height: 500, // set the height limit to your liking
    overflow: "auto",
  },
  item: {
    width: "auto",
  },
});

const ListSignatories = (props) => {
  const countries = new Set();
  const [data, setData] = useState([]);
  const config = useCampaignConfig();
  const classes = useStyles();
  const form = useForm({
    mode: "onBlur",
    //    nativeValidation: true,
  });

  const url =
    "https://static.proca.app/ep2024/" + config.campaign.name + ".json";

  props.campaign;
  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.statusText;

      const d = await res.json();
      setData(d);
    };
    if (!url) return;
    fetchData(url);
  }, [url, setData]);

  //r = <Country form={props.form} list={config.component.email?.countries} />;
  data.map((d) => countries.add(d.area));
  //var obj = Array.from(countries).reduce(function(o, val) { o[val] = false; return o; }, {});
  //console.log(obj);

  return (
    <>
      <Country form={form} />
      <List dense={true} disablePadding={true} className={classes.container}>
        {data.map((d) => (
          <ListItem key={`supporter-${d.externalId}`} className={classes.item}>
            <ListItemAvatar>
              <Avatar alt={d.name} src={d.field.picture} />
            </ListItemAvatar>
            <ListItemText primary={d.name} secondary={d.field.party} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ListSignatories;
