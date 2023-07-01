import React, { useState, useEffect, useRef } from "react";
import { Typography, Grid } from "@mui/material";
import ImageSelector from "../ImageSelector";
import { shuffle } from "@lib/array";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import makeStyles from '@mui/styles/makeStyles';
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "@hooks/useConfig";

const useStyles = makeStyles(() => ({
  /*  const theme = createTheme({
  memeText: {
    minHeight: "0!important",
  },
  components: {
    inputMultiline: {
      minHeight: "2px!important",
    },
  },
  overrides: {
    inputMultiline: {
      minHeight: "1px!important",
    },
  },
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
          src: url('http://static.proca.app/font/anton-regular.woff2') format('woff2');
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
    fontFamily: "Anton, sans-serif",
  },
  preview: {
    textTransform: "uppercase",
    fill: "#FFF",
    stroke: "#000",
    strokeWidth: 1.5,
    userSelect: "none",
    fontFamily: "Anton, sans-serif",
  },
  aaselected: {
    position: "relative",
    height: 250,
    width: "100%",
  },
}));

const CreateMeme = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [current, setCurrent] = useState(0);
  const canvasRef = useRef();
  const classes = useStyles();
  const form = props.form;
  const { setValue, watch } = form;
  const [topText, bottomText] = watch(["topText", "bottomText"]);
  const supabase = useSupabase();

  if (props.myref && props.name && !props.myref.current[props.name]) {
    const fct = async (data) => {
      console.log("prepareData in meme", data, items);

      if (!data) return null;
      return data;
    };
    props.myref.current[props.name] = fct;
    console.log("ref", props.myref.current);
  }

  const [items, setItems] = useState([]);
  useEffect(() => {
    let isCancelled = false;
    let templates = [];
    (async function () {
      const r = await fetch(
        config.component.meme?.list ||
          "https://widget.proca.app/t/meme/template.json",
        {}
      );
      if (!r.ok) {
        return {
          errors: [
            { message: r.statusText, code: "http_error", status: r.status },
          ],
        };
      }
      if (!isCancelled) {
        const response = await r.json();
        shuffle(response);
        response.forEach((d) => {
          templates.push({
            top: t("campaign:meme." + d.top_text.replaceAll("_", "-"), ""),
            bottom: t(
              "campaign:meme." + d.bottom_text.replaceAll("_", "-"),
              ""
            ),
            name: d.top_text.split(".")[0],
            original: d.image,
          });
        });
        setItems(templates);
        //force update here, otherwise the selection is done before the items are set
        setValue("topText", templates[0].top);
        setValue("bottomText", templates[0].bottom);
      }
    })(setItems);

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectOne = (i) => {
    if (!items[i]) {
      return false;
    }
    setValue("topText", items[i].top);
    setValue("bottomText", items[i].bottom);
    setCurrent(i);
  };

  const addImage = (newImage) => {
    setItems([...items, newImage]);
    setValue("topText", newImage.top);
    setValue("bottomText", newImage.bottom);
    setCurrent(items.length);
  };

  useEffect(() => {
    if (document && document.fonts) {
      setTimeout(function () {
        document.fonts.load("20px Anton").then(() => {
          selectOne(0);
        });
      }, 0);
    } else {
      setCurrent(0);
    }
    // eslint-disable-next-line
  }, []); //calling only once

  const EmptyItem = () => null;

  const generateCanvasMeme = (image, param) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");

    canvas.width = param.width;
    canvas.height = param.height;
    canvas.id = "proca-meme";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, param.width, param.height);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";

    // Top text font size
    let fontSize = param.fontSize;
    ctx.font = `${fontSize}px Anton, sans-serif`;
    ctx.lineWidth = param.fontSize / 20;

    ctx.textBaseline = "top";

    param.topText &&
      param.topText
        .toUpperCase()
        .split("\n")
        .forEach((t, i) => {
          ctx.fillText(
            t,
            canvas.width / 2,
            fontSize * 0.4 + i * fontSize,
            canvas.width
          );
          ctx.strokeText(
            t,
            canvas.width / 2,
            fontSize * 0.4 + i * fontSize,
            canvas.width
          );
        });

    ctx.textBaseline = "bottom";
    param.bottomText &&
      param.bottomText
        .toUpperCase()
        .split("\n")
        .reverse()
        .forEach((t, i) => {
          ctx.fillText(
            t,
            canvas.width / 2,
            canvas.height - i * fontSize + fontSize * 0.0,
            canvas.width
          );
          ctx.strokeText(
            t,
            canvas.width / 2,
            canvas.height - i * fontSize + fontSize * 0.0,
            canvas.width
          );
        });
  };

  const validateMeme = async () => {
    if (items.length === 0) return console.error("context lost");
    return saveMeme();
  };

  const getHash = async () => {
    let d = {
      image: items[current].original,
      top_text: topText,
      bottom_text: bottomText,
    };

    const encoder = new TextEncoder();
    const m = JSON.stringify(d, Object.keys(d).sort());
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(m));
    const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
      .replace(/\+/g, "_")
      .replace(/\//g, "-")
      .replace(/=+$/g, "");
    // hash = base64url of the sha256
    return hash;
  };
  const saveMeme = async () => {
    const toBlob = () =>
      new Promise((resolve) => {
        canvasRef.current.toBlob(resolve, "image/jpeg", 81);
      });

    const blob = await toBlob();

    const hash = await getHash();

    let d = {
      image: items[current].original,
      top_text: topText,
      bottom_text: bottomText,
      hash: hash,
      lang: config.lang,
    };
    //const f = items[current].original.split("/");
    let r = await supabase.from("meme").insert([d]);
    if (r.status === 409) {
      return true;
    }
    r = await supabase.storage
      .from("together4forests")
      .upload("meme/" + hash + ".jpeg", blob, {
        cacheControl: "3600",
        upsert: false,
      });
    if (r.error) {
      if (r.error.statusCode === "23505") {
        //duplicated
        return true;
      }
      console.log(r.error);
      return false;
    }
    return true;
  };

  const item = (items[current] && items[current].original) || "";
  useEffect(() => {
    let base_image = new Image();
    base_image.setAttribute("crossOrigin", "anonymous");
    base_image.src = item;
    base_image.addEventListener(
      "load",
      async function () {
        const lineLength = (
          text // returns the max line Length if multiline text
        ) =>
          text &&
          text
            .split("\n")
            .reduce((max, d) => (d.length > max ? d.length : max), 0);
        const autoSplit = (
          text // split if not split already
        ) =>
          text.includes("\n")
            ? text
            : text.replace(/[\s\S]{1,35}(?!\S)/g, "$&\n");
        const wrh = base_image.width / base_image.height;
        const width = 300; //might be too small?
        const height = width / wrh;
        const top = autoSplit(topText);
        const bottom = autoSplit(bottomText || items[current].bottom); //workaround, sometimes the bottomText isnt' set

        const length = Math.max(lineLength(top), lineLength(bottom));
        let fontSize = 2 + (2 * width) / length;
        if (fontSize > 50) fontSize = 50;

        generateCanvasMeme(base_image, {
          topText: top,
          bottomText: bottom,
          width: width,
          height: height,
          fontSize: fontSize,
        });
        const hash = await getHash();
        setValue(
          "image",
          process.env.REACT_APP_SUPABASE_URL +
            "/storage/v1/object/public/together4forests/meme/" +
            hash +
            ".jpeg"
        );
        setValue("hash", hash);
        setValue("dimension", "[" + width + "," + height + "]");
      },
      false
    );
    // eslint-disable-next-line
  }, [item, topText, bottomText]);

  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <input type="hidden" {...props.form.register("hash")} />
        <input
          type="hidden"
          {...props.form.register("image", { validate: validateMeme })}
        />
        <input type="hidden" {...props.form.register("dimension")} />
        <Typography variant="subtitle1" element="div" color="textSecondary">
          {t("campaign:meme.explain")}
        </Typography>
        <style>
          {`
        @font-face {
          font-family: 'Anton';
          src: url('https://static.proca.app/font/anton-regular.woff2') format('woff2');
        }
      `}
        </style>
        <TextField
          className={classes.memeText}
          fullWidth
          inputProps={{ maxLength: 65 }}
          form={form}
          multiline
          name="topText"
          label={t("campaign:meme.topText", "top")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          inputProps={{ maxLength: 65 }}
          className={classes.memeText}
          form={form}
          name="bottomText"
          multiline
          label={t("campaign:meme.bottomText", "bottom")}
        />
      </Grid>
      <canvas ref={canvasRef} className={classes.responsive} />
      {/*      <Grid item xs={12}>
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
      </Grid>*/}
      <Typography variant="subtitle1" element="div" color="textSecondary">
        {t("campaign:meme.gallery")}
      </Typography>
      <ImageSelector
        items={items}
        onClick={selectOne}
        Selected={EmptyItem}
        addImage={addImage}
      />
    </Grid>
  );
};

export default CreateMeme;
