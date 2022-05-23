import React from "react";
import { Button, Grid, Card, CardMedia, Typography } from "@material-ui/core";
import ImageSelector from "../ImageSelector";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   selected: {
        position: "relative",
        height: 250,
        width:"100%"
    }
}));

const Item = (props) => {
  const classes = useStyles();
  //<Grid item  xs={12 / props.total}>
  return (
    <Grid item xs={12}>
      <CardMedia
       
        className={classes.selected}
        image={props.original}
        title={props.name}
      ></CardMedia>
      <Typography className="MediaCaption">{props.name}</Typography>
    </Grid>
  );
};
const CreateMeme = (props) => {
  const { t } = useTranslation();
  const form = props.form;
  var items = [
    {
      name: "Random Meme #1 trying to put it wide",
      original: "https://static.tttp.eu/tg4/images/back1.jpeg",
    },
    {
      name: "Random Meme #2",
      original: "https://static.tttp.eu/tg4/images/back2.jpeg",
    },
    {
      name: "Random Meme #3",
      original: "https://static.tttp.eu/tg4/images/back3.jpeg",
    },
  ];

  const handleClick = () => {

  }
  return (
    <Grid container>
      <Grid item xs={12}>
        <TextField
          form={form}
          name="topText"
          label={t("meme.toptext", "Text at the top")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          form={form}
          name="bottomText"
          label={t("meme.bottomtext", "Text at the bottom")}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          form={form}
          name="generate"
          color="primary"
                  variant="contained"
                  fullWidth
                  onClick={handleClick}
                  size="large"
        >{t("meme.generate", "Generate your Meme")}</Button>
    </Grid>

      <ImageSelector items={items} Selected={Item} />
    </Grid>
  );
};

export default CreateMeme;
