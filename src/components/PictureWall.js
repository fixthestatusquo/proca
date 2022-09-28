import React, { useState, useEffect, useMemo } from "react";

import { useSupabase } from "@lib/supabase";
import ProgressCounter from "@components/ProgressCounter";
import Dialog from "@components/Dialog";
import { TextField, MenuItem, Grid } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
import { decode } from "blurhash";

export const localeName = {
  cs: "čeština",
  sv: "svenska",
  lv: "latviešu",
  hr: "hrvatski",
  es: "español",
  en_GB: "British English",
  it: "italiano",
  ar: "العربية",
  hu: "magyar",
  el: "Ελληνικά",
  fr_CA: "français canadien",
  ga: "Gaeilge",
  sl: "slovenščina",
  fi: "suomi",
  da: "dansk",
  sk: "slovenčina",
  mt: "Malti",
  ca: "català",
  fr: "français",
  lt: "lietuvių",
  de: "Deutsch",
  ru: "русский",
  bg: "български",
  en: "English",
  et: "eesti",
  ro: "română",
  pl: "polski",
  hi: "हिन्दी",
  pt: "português",
  he: "עברית",
  sr: "српски",
  ce: "нохчийн",
  nl: "Nederlands",
};

const useStyles = makeStyles((theme) => ({
  img: {
    maxWidth: "100%",
    maxHeight: "100%",
    height: "auto",
    width: "auto",
    cursor: "pointer",
    borderRadius: 5,
  },
}));

const setBlurhash = (event, picture) => {
  event.target.onError = null;
  event.target.srcset = event.target.src;
};

const getBackground = (picture) => {
  if (!picture.blurhash) return null;

  const w = picture.width,
    h = picture.height;
  const pixels = decode(picture.blurhash, w, h);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(w, h);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL();
  return dataUrl;
  //  return "url(" + dataUrl + ")";
};

const usePlaceholder = (width, height) =>
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "lightgrey";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL();
    return dataUrl;
  }, [width, height]);

const PictureWall = (props) => {
  const classes = useStyles();
  const supabase = useSupabase();
  const [pictures, setPictures] = useState([]);
  const [selected, select] = useState(false);
  const [language, setLanguage] = useState("?");
  const [languages, setLanguages] = useState([]);
  const config = useCampaignConfig();
  const campaign = config.campaign.name.replaceAll("_", "-");
  const placeholder = usePlaceholder(600, 800);
  const handleClose = (d) => {
    select(false);
  };

  useEffect(() => {
    console.log("WIP");
    (async () => {
      if (config.component.wall.language !== true) return;
      let { data, error } = await supabase
        .from("picture_languages")
        .select("lang,total")
        .order("total", { ascending: false });
      if (error) {
        console.error(error);
        return;
      }
      setLanguages(data);
    })();
  }, [config.component.wall.language, supabase]);

  useEffect(() => {
    (async () => {
      let query = supabase
        .from("pictures")
        .select("hash,legend,lang,blurhash,width,height")
        .order("id", { ascending: false })
        .eq("campaign", config.campaign.name)
        .eq("enabled", true);

      if (language && language !== "?") {
        query = query.eq("lang", language);
      }
      let { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }
      setPictures(data);
    })();
  }, [language, config.campaign.name, supabase]);

  const LanguageSelect = (props) => {
    if (config.component.wall.language !== true) return null;
    return (
      <TextField
        id="language"
        select
        variant="filled"
        label="Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <MenuItem key="?" value="?">
          Choose your language
        </MenuItem>
        {languages.map((option) => (
          <MenuItem key={option.lang} value={option.lang}>
            {localeName[option.lang]}
          </MenuItem>
        ))}
      </TextField>
    );
  };
  return (
    <>
      <Dialog dialog={selected !== false} close={handleClose}>
        {selected !== false && (
          <img
            className={classes.img}
            loading="lazy"
            src={
              process.env.REACT_APP_SUPABASE_URL +
              "/storage/v1/object/public/" +
              campaign +
              "/public/" +
              pictures[selected].hash +
              ".jpg"
            }
            alt={pictures[selected].legend}
          />
        )}
      </Dialog>
      {false && <ProgressCounter />}
      <LanguageSelect options={languages} />
      <Grid container spacing={1} justifyContent="center" alignItems="center">
        {pictures.map((d, i) => (
          <Grid key={d.hash} xs={12} sm={3} item onClick={() => select(i)}>
            <img
              className={classes.img}
              onError={(e) => setBlurhash(e, d)}
              style={{ backgroundImage: getBackground(d) }}
              src={getBackground(d) || placeholder}
              size="100px"
              srcset={
                process.env.REACT_APP_SUPABASE_URL +
                "/storage/v1/object/public/" +
                campaign +
                "/public/" +
                d.hash +
                ".jpg"
              }
              alt={d.legend}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default PictureWall;
