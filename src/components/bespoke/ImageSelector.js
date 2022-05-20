import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ImageList from "@material-ui/core/ImageList";
import ImageListItem from "@material-ui/core/ImageListItem";
import ImageListItemBar from "@material-ui/core/ImageListItemBar";
import IconButton from "@material-ui/core/IconButton";
import AttachIcon from "@material-ui/icons/AttachFile";
import { Grid, Card, CardActionArea, CardMedia, Typography } from "@material-ui/core";
import Backdrop from "@material-ui/core/Backdrop";
import { InputLabel } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   selected: {
        position: "relative",
        height: "100%"
    },
    image: {
        zIndex: 1,
      weigth:"100%",
    },
    MuiCardActionArea:{
        height: "inherit",
        zIndex: 1
    },

  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  },
  imageList: {
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
    cursor: "pointer",
    height: "100px",
  },
  selected: {
    width:"100%"
  },

  default: {
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

const ImageSelected = props => {
  const classes = useStyles();
  return (
      <Card className={classes.selected}>
    <CardActionArea classes={{root: classes.MuiCardActionArea}} >
    <img src={props.original} className={classes.image} />
    </CardActionArea>
      </Card>
  );
}

const ImageSelector = (props) => {
  const classes = useStyles();
  const [selected, _select] = useState(1);
  const select = (i) => {
    _select(i);
  };

  const Selected = props.Selected || ImageSelected;
  return (
    <>
    <Selected {...props.items[selected]} />
      <ImageList className={classes.imageList} cols={3.7} rows={1}>
        {props.items.map((d, i) => (
          <ImageListItem
            key={i}
            className={d === selected ? classes.selected : classes.default}
            onClick={() => select(i)}
          >
            <img src={props.items[i].original} />
          </ImageListItem>
        ))}
      </ImageList>
    </>
  );
};

export default ImageSelector;
