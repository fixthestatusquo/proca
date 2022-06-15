import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { Button, Card, CardActionArea } from "@material-ui/core";
import { List, ListItem } from "@material-ui/core";

//import UploadIcon from '@material-ui/icons/CloudUploadTwoTone';
import UploadIcon from "@material-ui/icons/PhotoCamera";

const useStyles = makeStyles((theme) => ({
  overflow: {
    overflow: "auto",
  },
  selected: {
    opacity: "0.8",
    position: "relative",
    aawidth: "100%",
  },
  thumb: {
    zIndex: 1,
    width: "30%",
  },
  image: {
    zIndex: 1,
    width: "100%",
  },
  imageList: {
    display: "flex",
    padding: 0,
    flexDirection: "row",
    flexWrap: "nowrap",
    width: "100%",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
    cursor: "pointer",
    aheight: "150px",
    maxWidth: 350,
    overflow: "auto",
    "& img": {
      aminWidth: "200px",
      maxHeight: 120,
      width: 100,
    },
  },

  default: {
    flex: "0 1 auto",
    opacity: "0.2",
    "&:hover": {
      opacity: "0.8",
    },
  },
  icon: {
    color: "white",
  },
  input: {
    display: "none",
  },
}));

const UploadButton = (props) => {
  const classes = useStyles();

  const getData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = (event) => {
        const r = `data:${file.type};base64,${btoa(event.target.result)}`;
        resolve(r);
      };
    });
  };

  const addImage = async (event) => {
    const file = event.target.files[0];
    const d = await getData(file);
    console.log("d", d);
    props.addImage(d);
  };

  return (
    <div className={classes.root}>
      <input
        accept="image/*"
        className={classes.input}
        id="contained-button-file"
        onChange={addImage}
        type="file"
      />
      <label htmlFor="contained-button-file">
        <Button
          variant="contained"
          color="primary"
          component="span"
          startIcon={<UploadIcon />}
        >
          Upload
        </Button>
      </label>
    </div>
  );
};

const ImageSelected = (props) => {
  const classes = useStyles();
  return (
    <Card>
      <CardActionArea>
        <img
          src={props.original}
          alt={props.name || props.topText || "meme"}
          className={classes.image}
        />
      </CardActionArea>
    </Card>
  );
};

const ImageSelector = (props) => {
  const classes = useStyles();
  const [items, setItems] = useState(props.items);
  const [selected, _select] = useState(0);
  const select = (i) => {
    _select(i);
    if (props.onClick) props.onClick(i);
  };

  useEffect(() => {
    if (items.length === 0 && props.items.length > 0) setItems(props.items);
  }, [props.items]);
  const Selected = props.Selected || ImageSelected;

  const addImage = (data) => {
    const newImage = { original: data, top: "", bottom: "" };
    //select (items.length);
    if (props.addImage) props.addImage(newImage);
    _select(items.length);
  };
  return (
    <>
      <Selected {...items[selected]} />
      <List className={classes.imageList}>
        {items.map((d, i) => (
          <ListItem
            disableGutters={true}
            dense={true}
            key={i}
            className={i === selected ? classes.selected : classes.default}
            onClick={() => select(i)}
          >
            <img
              src={items[i].original}
              alt={items[i].name || items[i].topText || "meme"}
              className={classes.thumb}
            />
          </ListItem>
        ))}
        <ListItem disableGutters={true} dense={true} key="new">
          <UploadButton addImage={addImage} />
        </ListItem>
      </List>
    </>
  );
};

export default ImageSelector;
