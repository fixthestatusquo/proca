import React from 'react';
import { Grid, Card, CardMedia, Typography } from '@material-ui/core';
import ImageSelector from "../ImageSelector";

const Item = (props) =>
{
                 //<Grid item  xs={12 / props.total}>
    return (
                 <Grid item xs={12} >
                <CardMedia
      style={{ height: "350px"}}
                    className="Media"
                    image={props.original}
                    title={props.name}
                >
                </CardMedia>
                    <Typography className="MediaCaption">
                        {props.name}
                    </Typography>

            </Grid>
        )
}
const CreateMeme = props => {
    var items = [
        {
            name: "Random Meme #1 trying to put it wide",
                    original:"https://static.tttp.eu/tg4/images/1.jpeg"
        },
        {
            name: "Random Meme #2",
                    original:"https://static.tttp.eu/tg4/images/2.jpeg"
        },
        {
            name: "Random Meme #3",
                    original:"https://static.tttp.eu/tg4/images/3.jpeg"
        }
    ]

    return (
      <Grid container>
            <ImageSelector items= {items} Selected= {Item}/>
      </Grid>
    )


};

export default CreateMeme;
