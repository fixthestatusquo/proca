import React, { useEffect, useState } from "react";
import { getLatest } from "../lib/server.js";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";

const ListSignature = (props) => {
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

  return (
    <List dense={true} disablePadding={true}>
      {list.map((k) => (
        <ListItem alignItems="flex-start" divider={false} key={k.id}>
          <ListItemAvatar>
            <Avatar src={k.picture} />
          </ListItemAvatar>
          <ListItemText
            primary={k.organisation}
            secondary=<a
              id={k.id}
              target="_blank"
              href={"https://twitter.com/" + k.twitter}
            >
              {k.twitter}
            </a>
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ListSignature;
