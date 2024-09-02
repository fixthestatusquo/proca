import React, { useState, useEffect, useLayoutEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { Button, Card, CardActionArea } from "@material-ui/core";
import { List, ListItem } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";

//import UploadIcon from '@material-ui/icons/CloudUploadTwoTone';
import UploadIcon from "@material-ui/icons/PhotoCamera";

const useStyles = makeStyles(() => ({
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
      maxHeight: 120,
      width: 100,
      maxWidth: "unset",
      padding: "0!important",
      marging: "0!important",
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
  const config = useCampaignConfig();

  const getData = async (file) => {
    return new Promise((resolve) => {
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
    props.addImage(d);
  };

  if (!config.component.meme?.upload) return null; // disable addImage
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
  const [width, setWidth] = useState(350);

  const select = (i) => {
    _select(i);
    if (props.onClick) props.onClick(i);
  };

  useLayoutEffect(() => {
    setTimeout(() => {
      const canvas = document.getElementById("proca-meme");
      const width = canvas?.offsetWidth;
      if (width) setWidth(width);
    }, 2000);
  }, [setWidth]);

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
      <List
        component="div"
        className={classes.imageList}
        style={{ maxWidth: width }}
      >
        {items.map((_d, i) => (
          <ListItem
            component="div"
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
