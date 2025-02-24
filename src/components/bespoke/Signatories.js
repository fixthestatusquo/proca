import React, { useEffect, useState } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import { TextField, Typography } from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { useTranslation } from "react-i18next";
import { useSupabase } from "@lib/supabase";

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
  const [selection, setSelection] = useState([]);
  const config = useCampaignConfig();
  const classes = useStyles();
  const supabase = useSupabase();

  useEffect(() => {
    const getSignatories = async () => {
      const q = supabase
        .from("signatories")
        .select("*")
        .eq("campaign_name", config.campaign.name)
        .select();
      const { data, error } = await q;

      if (error) {
        console.error(error);
        return null;
      }
      if (!data) return null;

      setSignatories(data);
      setSelection(data);
    };
    getSignatories();
  }, []);

  useEffect(() => {
    const getParties = async url => {
      const res = await fetch(url);
      if (!res.ok) throw res.statusText;
      const partiesData = await res.json();
      setParties(partiesData);
    };
    getParties(config.component.party?.url);
  }, []);

  return (
    <div id="proca-signature">
      <Grid container spacing={1}>
        <Typography variant="h5">
          {signatories.length} {t("signed", "have signed the pledge")}
        </Typography>
        <Grid item>
          {parties.length > 0 && (
            <TextField
              select={true}
              name="party"
              label={t("party")}
              onChange={e => {
                e.target.value
                  ? setSelection(
                      signatories.filter(p => p.party == e.target.value)
                    )
                  : setSelection(signatories);
              }}
              SelectProps={{
                native: true,
              }}
            >
              <option key="empty" value={null} />
              {parties.map(d => {
                return (
                  <option key={d.party} value={d.party}>
                    {d.party}
                  </option>
                );
              })}
            </TextField>
          )}

          <List
            dense={true}
            disablePadding={true}
            className={classes.container}
          >
            {selection.map(d => (
              <ListItem
                key={`supporter-${d.id}`}
                className={classes.item}
                ContainerComponent="div"
              >
                {d.picture &&
                  <ListItemAvatar>
                    <Avatar
                      alt={d.first_name + " " + d.last_name}
                      src={d.picture}
                    />
                  </ListItemAvatar>
                }
                {(d.organisation_sign && d.organisation) ?
                  <ListItemText
                    primary={d.organisation.toUpperCase()}
                    secondary={d.lab}
                  />
                  :
                  <ListItemText
                    primary={(d.first_name + " " + d.last_name).toUpperCase()}
                    secondary={d.organisation || (d.region || d.party ? d.party + ", " + d.region : d.party)}
                  />
                }
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </div>
  );
};

export default Signatories;
