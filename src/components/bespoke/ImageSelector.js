import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { Card, CardActionArea, CardMedia } from "@material-ui/core";
import { InputLabel, List, ListItem } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  selected: {
    opacity: "0.8",
    position: "relative",
    width: "100%",
  },
  image: {
    zIndex: 1,
    width: "100%",
  },
  MuiCardActionArea: {
    height: "inherit",
    zIndex: 1,
  },
  imageList: {
    display: "flex",
    padding: 0,
    flexDirection: "row",
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
    cursor: "pointer",
    height: "150px",
  },
  selectedImage: {
    width: "100%",
  },

  default: {
    position: "relative",
    width: "100%",
    opacity: "0.2",
    "&:hover": {
      opacity: "0.8",
    },
  },
  title: {
    color: theme.palette.primary.light,
  },
  icon: {
    color: "white",
  },
  titleBar: {
    background:
      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
}));

const ImageSelected = (props) => {
  const classes = useStyles();
  return (
    <Card className={classes.selectedImage}>
      <CardActionArea classes={{ root: classes.MuiCardActionArea }}>
        <img src={props.original} className={classes.image} />
      </CardActionArea>
    </Card>
  );
};

const ImageSelector = (props) => {
  const classes = useStyles();
  const [selected, _select] = useState(1);
  const select = (i) => {
    _select(i);
    if (props.onClick) props.onClick(i);
  };

  const Selected = props.Selected || ImageSelected;
  return (
    <>
      <Selected {...props.items[selected]} />
      <List className={classes.imageList}>
        {props.items.map((d, i) => (
          <ListItem
            disableGutters={true}
            dense={true}
            key={i}
            className={i === selected ? classes.selected : classes.default}
            onClick={() => select(i)}
          >
            <img src={props.items[i].original} className={classes.image} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ImageSelector;
