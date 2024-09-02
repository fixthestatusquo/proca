import React, { useEffect, useState } from "react";
import { getLatest } from "@lib/server.js";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import TwitterIcon from "../images/Twitter.js";
import SvgIcon from "@material-ui/core/SvgIcon";
import IconButton from "@material-ui/core/IconButton";

const ListSignature = () => {
  const [list, setList] = useState([]);
  const actionPage = 80;
  useEffect(() => {
    let isCancelled = false;
    let c = null;
    (async () => {
      c = await getLatest(actionPage, "openletter");
      if (!isCancelled) setList(c);
    })();
    return () => {
      isCancelled = true;
    };
  }, [actionPage]);

  const tweet = (screen_name) => {
    const url = `https://twitter.com/${screen_name}`;
    window.open(
      url,
      `tweet-${screen_name}`,
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
            title={`${k.twitter} (${k.followers_count} followers)`}
          >
            <IconButton
              edge="end"
              aria-label="Tweet"
              onClick={() => tweet(k.twitter)}
            >
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
