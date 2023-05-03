import React, { useState, useEffect, useMemo } from "react";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "@hooks/useConfig";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";

const Wall = (props) => {
  const supabase = useSupabase();
  const [comments, setComments] = useState([]);
  const [country, setCountry] = useState("?");
  const [countries, setCountries] = useState([]);
  const config = useCampaignConfig();
  const campaign = config.campaign.name.replaceAll("_", "-");

  useEffect(() => {
    (async () => {
      let query = supabase
        .from("comments")
        .select("id,area,lang,name, comment")
        .order("id", { ascending: false })
        .eq("campaign", config.campaign.name)
        .eq("enabled", true);

      if (country && country !== "?") {
        query = query.eq("lang", country);
      }
      let { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }
      setComments(data);
    })();
  }, [country, config.campaign.name, supabase]);

  return (
    <List dense>
      {comments.map((d) => (
        <ListItem key={d.id} alignItems="flex-start">
          <ListItemText primary={d.name} secondary={d.comment} />
        </ListItem>
      ))}
    </List>
  );
};

export default Wall;
