import React, { useEffect, useState } from "react";
import { getLatest } from "@lib/server.js";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import TwitterIcon from "../images/Twitter.js";
import SvgIcon from "@mui/material/SvgIcon";
import IconButton from "@mui/material/IconButton";

const ListSignature = () => {
  const [list, setList] = useState([]);
  const actionPage = 80;
  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async function () {
      c = await getLatest(actionPage, "openletter");
      if (!isCancelled) setList(c);
    })();
    return () => {
      isCancelled = true;
    };
  }, [actionPage]);

  const tweet = (screen_name) => {
    const url = "https://twitter.com/" + screen_name;
    window.open(
      url,
      "tweet-" + screen_name,
      "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=550"
    );
  };
  const visit = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
    <List dense={true} disablePadding={true}>
      {list.map((k) => (
        <ListItem
          alignItems="flex-start"
          divider={false}
          key={k.id}
          button={true}
          onClick={() => visit(k.url)}
        >
          <ListItemAvatar>
            <Avatar src={k.picture} />
          </ListItemAvatar>
          <ListItemText primary={k.organisation} secondary={k.comment} />
          <ListItemSecondaryAction
            title={k.twitter + " (" + k.followers_count + " followers)"}
          >
            <IconButton
              edge="end"
              aria-label="Tweet"
              onClick={() => tweet(k.twitter)}
              size="large">
              <SvgIcon>
                <TwitterIcon />
              </SvgIcon>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default ListSignature;
