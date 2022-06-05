import React, { useState, useEffect, useRef } from "react";
import { Button, Grid, Typography } from "@material-ui/core";
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
    maxWidth: "100%",
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

const CreateMeme = (props) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [param, setParam] = useState({ width: 600, height: 400, fontSize: 20 });
  const svgRef = useRef();
  const canvasRef = useRef();
  const imgRef = useRef();
  const classes = useStyles();
  const form = props.form;
  const { setValue, watch } = form;
  const { topText, bottomText } = watch(["topText", "bottomText"]);

  useEffect(() => {
    selectOne(0);
  }, []);

  const EmptyItem = (props) => null;

  const generateCanvasMeme = (image, param) => {
    //const canvas = document.createElement("canvas");
    //const canvas = document.getElementById('meme-canvas');
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");

    canvas.width = param.width;
    canvas.height = param.height;
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw main image
    ctx.drawImage(image, 0, 0, param.width, param.height);
    // Text style: white with black borders
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";

    // Top text font size
    let fontSize = param.fontSize;
    console.log(fontSize);
    ctx.font = `${fontSize}px Anton`;
    ctx.lineWidth = param.fontSize / 20;

    ctx.textBaseline = "top";
    topText
      .toUpperCase()
      .split("\n")
      .forEach((t, i) => {
        ctx.fillText(t, canvas.width / 2, 20 + i * fontSize, canvas.width);
        ctx.strokeText(t, canvas.width / 2, 20 + i * fontSize, canvas.width);
      });

    ctx.textBaseline = "bottom";
    bottomText
      .toUpperCase()
      .split("\n")
      .reverse()
      .forEach((t, i) => {
        // .reverse() because it's drawing the bottom text from the bottom up
        ctx.fillText(
          t,
          canvas.width / 2,
          -20 + canvas.height - i * fontSize,
          canvas.width
        );
        ctx.strokeText(
          t,
          canvas.width / 2,
          -20 + canvas.height - i * fontSize,
          canvas.width
        );
      });
  };

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
    generateCanvasMeme();
  };

  const selectOne = (i) => {
    setValue("topText", items[i].top);
    setValue("bottomText", items[i].bottom);
    setCurrent(i);
  };

  useEffect(() => {
    const base_image = new Image();
    base_image.src = items[current].original;
    const wrh = base_image.width / base_image.height;
    const width = 600;
    const height = width / wrh;

    const length = Math.max(topText?.length, bottomText?.length);
    let fontSize = (2 * width) / length;
    if (fontSize > 50) fontSize = 50;
    setParam({ width: width, height: height, fontSize: fontSize });

    generateCanvasMeme(base_image, {
      width: width,
      height: height,
      fontSize: fontSize,
    });
  }, [current, topText, bottomText]);

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
      <canvas ref={canvasRef} className={classes.responsive} />

      {/*      <svg
        ref={svgRef}
        className={classes.responsive}
        viewBox={"0 0 " + param.width + " " + param.height}
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
        <image 
        ref={imgRef}
    href={items[current].original} height={param.height} width={param.width} />
        {["previewShadow", "preview"].map((d) => (
          <text
            className={classes[d]}
            textAnchor="middle"
            fontSize={param.fontSize}
            y={10 + param.fontSize}
            x={param.width / 2}
          >
            {topText}
          </text>
        ))}
        {["previewShadow", "preview"].map((d) => (
          <text
            className={classes[d]}
            textAnchor="middle"
            fontSize={param.fontSize}
            y={param.height - param.fontSize + 20}
            x={param.width / 2}
          >
            {bottomText}
          </text>
        ))}
      </svg>
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
          Generate your Meme
        </Button>
      </Grid>
      <ImageSelector items={items} onClick={selectOne} Selected={EmptyItem} />
    </Grid>
  );
};

export default CreateMeme;
