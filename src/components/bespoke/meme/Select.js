import React from "react";
import { Grid, Typography } from "@material-ui/core";
import ImageSelector from "../ImageSelector";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(() => ({
  responsive: {
    width: "100%",
  },
}));

const Item = props => {
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
const CreateMeme = () => {
  var items = [];

  //  return (<Item {...items[0]}/>);
  return (
    <Grid container>
      <ImageSelector items={items} Selected={Item} />
    </Grid>
  );
};

export default CreateMeme;
