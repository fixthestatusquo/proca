import React, { useState, useEffect, useRef } from "react";
import { Button, Grid, Card, CardMedia, Typography } from "@material-ui/core";
import ImageSelector from "../ImageSelector";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  /*  const theme = createTheme({
  typography: {
    fontFamily: 'Anton, Arial',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Anton';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url('http://static.proca.app/font/anton.woff2') format('woff2');
        }
      `,
    },
  },
});*/
  responsive: {
    width: "100%",
    margin: "auto",
    display: "block",
    textShadow: "1px 1px 1px #000",
  },
  previewShadow: {
    textTransform: "uppercase",
    filter: "url(#proca-glow)",
    fill: "#000",
    strokeWidth: 0.5,
    userSelect: "none",
    fontFamily: "Anton",
  },
  preview: {
    textTransform: "uppercase",
    fill: "#FFF",
    stroke: "#000",
    strokeWidth: 1.5,
    userSelect: "none",
    fontFamily: "Anton",
  },
  aaselected: {
    position: "relative",
    height: 250,
    width: "100%",
  },
}));

const Item = (props) => {
  const classes = useStyles();
  //<Grid item  xs={12 / props.total}>
  return (
    <Grid container>
      <img src={props.original} className={classes.responsive} />
      <Typography className="MediaCaption">{props.name}</Typography>
    </Grid>
  );
};

const EmptyItem = (props) => null;

const convertSvgToImage = (svgElement) => {
  const { width, height } = svgElement.getBBox();
  const clonedSvgElement = svgElement.cloneNode(true);
  const outerHTML = clonedSvgElement.outerHTML;
  const blob = new Blob([outerHTML], { type: "image/svg+xml;charset=utf-8" });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    let canvas = document.createElement("canvas");
    canvas.width = width;

    canvas.height = height;
    const context = canvas.getContext("2d");
    // draw image in canvas starting left-0 , top - 0
    context.drawImage(image, 0, 0, width, height);
    //  downloadImage(canvas); need to implement};
    image.src = blobURL;
    let jpeg = canvas.toDataURL("image/jpeg");
    console.log(jpeg);
    const img = document.createElement("img");
    img.setAttribute("src", jpeg);
    return img;
//    document.body.appendChild(img);
  };
image.src = blobURL;
  /*
    let svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    const svgSize = svg.getBoundingClientRect();
  console.log(svgSize);

    canvas.width = svgSize.width;
    canvas.height = svgSize.height;
    const img = document.createElement("img");
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
  console.log(img);
      document.body.appendChild(img);
    img.onload = function() {
      canvas.getContext("2d").drawImage(img, 0, 0);
      const canvasdata = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = "meme.png";
      a.href = canvasdata;
      document.body.appendChild(a);
//      a.click();
    };
    */
};

const CreateMeme = (props) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const svgRef = useRef();
  const classes = useStyles();
  const form = props.form;
  const { setValue, watch } = form;
  const { topText, bottomText } = watch(["topText", "bottomText"]);

  var items = [
    {
      top: "My options when I look for",
      bottom: "Deforestation-free food",
      original: "https://static.tttp.eu/tg4/images/back3.jpeg",
    },
    {
      top: "A good law on deforestation",
      bottom: "must please companies",
      original: "https://static.tttp.eu/tg4/images/back1.jpeg",
    },
    {
      top: "MEPs wanting to really stop deforestation",
      bottom: "the rest of the EP?",
      name: "Random Meme #3",
      original: "https://static.tttp.eu/tg4/images/back2.jpeg",
    },
  ];

  const handleClick = () => {
    convertSvgToImage(svgRef.current);
  };

  const selectOne = (i) => {
    setValue("topText", items[i].top);
    setValue("bottomText", items[i].bottom);
    setCurrent(i);
  };

  const base_image = new Image();
  base_image.src = items[current].original;
  const wrh = base_image.width / base_image.height;
  const width = 600;
  const height = width / wrh;

  const length = Math.max(topText?.length, bottomText?.length);
  let fontSize = (2 * width) / length;
  if (fontSize > 50) fontSize = 50;
  fontSize = fontSize;
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <style>
          {`
        @font-face {
          font-family: 'Anton';
          src: url('https://static.proca.app/font/anton.woff2') format('woff2');
        }
      `}
        </style>
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

      <svg
        ref={svgRef}
        className={classes.responsive}
        viewBox={"0 0 " + width + " " + height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="proca-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10 10" result="proca-glow" />
            <feMerge>
              <feMergeNode in="glow" />
            </feMerge>
          </filter>
        </defs>
        <image href={items[current].original} height={height} width={width} />
        {["previewShadow", "preview"].map((d) => (
          <text
            className={classes[d]}
            textAnchor="middle"
            fontSize={fontSize}
            y={10 + fontSize}
            x={width / 2}
          >
            {topText}
          </text>
        ))}
        {["previewShadow", "preview"].map((d) => (
          <text
            className={classes[d]}
            textAnchor="middle"
            fontSize={fontSize}
            y={height - fontSize + 20}
            x={width / 2}
          >
            {bottomText}
          </text>
        ))}
      </svg>
      {/*     <div id="preview" className={classes.preview}>
      <div className={classes.topPreview}>{topText}</div>
      <div className={classes.bottomPreview}>{bottomText}</div>
      <img src={items[current].original} className={classes.responsive}/>
      </div>
    */}
      <Grid item xs={12}>
        <Button
          form={form}
          name="generate"
          color="primary"
          variant="contained"
          fullWidth
          onClick={handleClick}
          size="large"
        >
          {t("meme.generate", "Generate your Meme")}
        </Button>
      </Grid>

      <ImageSelector items={items} onClick={selectOne} Selected={EmptyItem} />
    </Grid>
  );
};

export default CreateMeme;
