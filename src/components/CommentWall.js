import React, { Fragment, useState, useEffect } from "react";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "@hooks/useConfig";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import QuoteIcon from "@mui/icons-material/FormatQuote";

const Wall = (props) => {
  const supabase = useSupabase();
  const [comments, setComments] = useState([]);
  //  const [country, setCountry] = useState(props.country);
  const country = props.country;
  //  const [countries, setCountries] = useState([]);
  const config = useCampaignConfig();
  const campaign = config.campaign.name.replaceAll("_", "-");

  useEffect(() => {
    (async () => {
      let query = supabase
        .from("comments")
        .select("id,area,lang,name, comment")
        .order("id", { ascending: false })
        .eq("campaign", campaign)
        .eq("enabled", true);

      if (country) {
        query = query.eq("area", country);
      }
      let { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }
      setComments(data);
    })();
  }, [country, campaign, supabase]);

  return (
    <List dense component="div">
      {comments.map((d) => (
        <Fragment key={d.id}>
          <ListItem alignItems="flex-start" component="div">
            <ListItemIcon>
              <QuoteIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={d.name} secondary={d.comment} />
          </ListItem>
          <Divider variant="inset" />
        </Fragment>
      ))}
    </List>
  );
};

export default Wall;
