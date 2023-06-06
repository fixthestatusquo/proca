import React from "react";
import { ListItem, ListItemText, ListItemAvatar } from "@material-ui/core";

import Skeleton from "@material-ui/lab/Skeleton";

const SkeletonListItem = () => {
  return (
    <ListItem alignItems="flex-start" component="div">
      <ListItemAvatar>
        <Skeleton animation="wave" variant="circle" width={42} height={42} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Skeleton
            animation="wave"
            height={20}
            width="70%"
            style={{ marginTop: 2 }}
          />
        }
        secondary={
          <Skeleton
            animation="wave"
            height={16}
            width="50%"
            style={{ marginTop: 2 }}
          />
        }
      />
    </ListItem>
  );
};

export default SkeletonListItem;
