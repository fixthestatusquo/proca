import React, { useEffect, useState, useCallback } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import { TextField } from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Avatar from "@material-ui/core/Avatar";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSupabase } from '@lib/supabase';

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

const Signatories = () => {
  const { t } = useTranslation();
  const [signatories, setSignatories] = useState([]);
  const [parties, setParties] = useState([]);
  const config = useCampaignConfig();
  const classes = useStyles();
  const form = useForm({
    mode: "onBlur"
  });
  const supabase = useSupabase();
    useEffect(() => {
      const getSignatories = async () => {
        const q = supabase
          .from('actions')
          .select('id, data')
          .eq('campaign_id', 795) // hardcoded!!!
          .eq('status', 'approved')
          .select();
        const { data, error } = await q;

        if (error) {
          console.error(error);
          return;
        }
        if (!data) return;

        const s = data.map((s) => ({
            id: s.id,
            createdAt: s.data.action.createdAt,
            name: s.data.contact.firstName + " " + s.data.contact.lastName,
            party: s.data.action.customFields["party"],
            riding: s.data.contact.address.region
          }))

        setSignatories(s);
        console.log(777777, s)
      }
      getSignatories();
    }, []);

    useEffect(() => {
      const getParties = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw res.statusText;
        const partiesData = await res.json();
        setParties(partiesData);
      };
      getParties(config.component.party.url);
    }, []);

  return (
    <div id="proca-signature">
        <Grid container spacing={1}>
        <Grid item xs={12} sm={7}>
       <TextField
          select={true}
          form={form}
          name="party"
          label={t("party")}
          //onChange={(e) => setParties(e.target.value)}
          SelectProps={{
            native: true,
          }}
        >
          <option key="empty" value=""></option>
          {parties
            .map((d) => {
              return (
                <option key={d.party} value={d.party}>
                  {d.party}
                </option>
              );
            })}
        </TextField>

      <List dense={true} disablePadding={true} className={classes.container}>
        {signatories.map((d) => (
          <ListItem
            key={`supporter-${d.id}`}
            className={classes.item}
            ContainerComponent="div"
          >
            <ListItemAvatar>
              <Avatar
                alt={d.name}
                // src={d.image}
              />
            </ListItemAvatar>
            <ListItemText
              primary={d.name}
              secondary={d.party}
            />

          </ListItem>
        ))}
      </List>
        </Grid>
        </Grid>
    </div>
  );
};

export default Signatories;
