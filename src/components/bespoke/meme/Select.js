import React from "react";
import { Grid, Typography } from "@material-ui/core";
import ImageSelector from "../ImageSelector";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  responsive: {
    width: "100%",
  },
}));

const Item = (props) => {
  const classes = useStyles();
  //<Grid item  xs={12 / props.total}>
  return (
    <Grid item xs={12}>
      <img
        src={props.original}
        className={classes.responsive}
        alt={props.name}
        crossOrigin="anonymous"
      />
      <Typography className="MediaCaption">{props.name}</Typography>
    </Grid>
  );
};
const CreateMeme = (props) => {
  var items = [
    {
      name: "Random Meme #1 trying to put it wide",
      original: "https://static.proca.app/tg4/images/1.jpeg",
    },
    {
      name: "Random Meme #2",
      original: "https://static.proca.app/tg4/images/2.jpeg",
    },
    {
      name: "Random Meme #3",
      original: "https://static.proca.app/tg4/images/3.jpeg",
    },
  ];

  //  return (<Item {...items[0]}/>);
  return (
    <Grid container>
      <ImageSelector items={items} Selected={Item} />
    </Grid>
  );
};

export default CreateMeme;
