import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ImageList from "@material-ui/core/ImageList";
import ImageListItem from "@material-ui/core/ImageListItem";
import ImageListItemBar from "@material-ui/core/ImageListItemBar";
import IconButton from "@material-ui/core/IconButton";
import AttachIcon from "@material-ui/icons/AttachFile";
import Backdrop from "@material-ui/core/Backdrop";
import { InputLabel } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
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
    cursor: 'pointer'
  },
  selected: {
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

const ImageSelector = (props) => {
  const classes = useStyles();
  const [selected, _select] = useState(1);
  const [open, setOpen] = useState(false);
  const ids = [1, 2, 3];
  const handleClose = () => {
    setOpen(false);
  };

  const select = (i) => {
    setOpen(true);
    _select(i);
  };

  return (
    <>
    <InputLabel>Attach an image :<i>{"meme #" + selected}</i></InputLabel>
      <Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <img src={"https://static.tttp.eu/tg4/images/" + selected + ".jpeg"} />
      </Backdrop>
      <ImageList className={classes.imageList} cols={2.2} rows={1}>
        {ids.map((d) => (
          <ImageListItem
            key={d}
            className={d === selected ? classes.selected : classes.default}
            onClick={() => select(d)}
          >
            <img src={"https://static.tttp.eu/tg4/images/" + d + ".jpeg"} />
            <ImageListItemBar
              title={"meme #" + d}
              position={d === selected ? "top" : "bottom"}
              actionIcon={
                <IconButton aria-label={`attach ${d}`} className={classes.icon}>
                  <AttachIcon />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </>
  );
};

export default ImageSelector;
