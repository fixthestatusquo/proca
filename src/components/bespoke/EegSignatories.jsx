import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import { Typography, LinearProgress} from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
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
  const [signatories, setSignatories] = useState(null);
  const classes = useStyles();
  const supabase = useSupabase();

  useEffect(() => {
    const getSignatories = async () => {
      const q = supabase
        .from("view_signatories_eeg")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await q;

      if (error) {
        console.error(error);
        return null;
      }
      if (!data) return null;
      console.log("data", data);

      // organization signatures need to be approved, but individual are displayed if not rejected
      const filtered = data.filter(
        (signature) =>
          (signature.organisation_sign === "true" && signature.status === "approved") ||
          (signature.organisation_sign !== "true" && signature.status !== "rejected")
      );
      setSignatories(filtered);
    };
    getSignatories();
  }, []);

  if (!signatories) return  <div id="proca-signature"><LinearProgress /></div>

  return (
    <div id="proca-signature">
      <Grid container spacing={1}>
        <Typography variant="h5">
          {signatories.length} {t("signed", "have signed the pledge")}
        </Typography>
        <Grid item>
          <List
            dense={true}
            disablePadding={true}
            className={classes.container}
          >
            {signatories.map(d => (
              <ListItem
                key={`supporter-${d.id}`}
                className={classes.item}
                ContainerComponent="div"
              >
                {(d.organisation_sign && d.organisation) ?
                  <ListItemText
                    primary={d.organisation.toUpperCase()}
                    secondary={d.lab}
                  />
                  :
                  <ListItemText
                    primary={(d.first_name + " " + d.last_name).toUpperCase()}
                    secondary={d.organisation}
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
