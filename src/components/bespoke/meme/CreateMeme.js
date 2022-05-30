import React from "react";
import { Button, Grid, Card, CardMedia, Typography } from "@material-ui/core";
import ImageSelector from "../ImageSelector";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  responsive: {
     width:'100%'
  },
   aaselected: {
        position: "relative",
        height: 250,
        width:"100%"
    }
}));

const Item = (props) => {
  const classes = useStyles();
  //<Grid item  xs={12 / props.total}>
  return (
    <Grid container>
      <img src={props.original} className={classes.responsive}/>
      <Typography className="MediaCaption">{props.name}</Typography>
    </Grid>
  );
};
const CreateMeme = (props) => {
  const { t } = useTranslation();
  const form = props.form;
  const { setValue } = form;

  var items = [
    {
      top:"My options when I look for",
      bottom:"Deforestation-free food",
      original: "https://static.tttp.eu/tg4/images/back1.jpeg",
    },
    {
      top:"A good law on deforestation",
      bottom:"must please companies",
      original: "https://static.tttp.eu/tg4/images/back2.jpeg",
    },
    {
      top:"MEPs wanting to really stop deforestation",
      bottom:"the rest of the EP?",
      name: "Random Meme #3",
      original: "https://static.tttp.eu/tg4/images/back3.jpeg",
    },
  ];

  const handleClick = () => {
  }
  const selectOne = i => {
    setValue ("topText",items[i].top);
    setValue ("bottomText",items[i].bottom);
  }

  return (
    <Grid item xs={12}>
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

      <ImageSelector items={items} onClick={selectOne} Selected={Item} />
    </Grid>
  );
};

export default CreateMeme;
