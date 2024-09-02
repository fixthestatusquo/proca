import React, { useState, useEffect, useMemo } from "react";

import { useSupabase } from "@lib/supabase";
import ProgressCounter from "@components/ProgressCounter";
import Dialog from "@components/Dialog";
import { TextField, MenuItem, Grid } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
import { decode } from "blurhash";
//import { decodeBlurHash as decode } from  "fast-blurhash";
//

const useStyles = makeStyles(() => ({
  bimg: {
    width: "100%",
    objectFit: "contain",
    borderRadius: 5,
  },
  timg: {
    //    animation: `$showImg 1300ms`,
    width: "100%",
    height: "auto",
    maxWidth: "100%",
    maxHeight: "100%",
    borderRadius: 5,
  },
  img: {
    //    animation: `$showImg 1300ms`,
    maxWidth: "100%",
    maxHeight: "100%",
    background: "lightgrey",
    objectFit: "contain",
    height: 0,
    //    height: "auto",
    //    width: "auto",
    cursor: "pointer",
    borderRadius: 5,
  },
  "@keyframes showImg": {
    "0%": {
      opacity: 0.4,
    },
    "100%": {
      opacity: 1,
    },
  },
}));

const setBlurhash = (event, picture) => {
  event.target.onError = null;
  event.target.src = getBackground(picture);
  //  event.target.srcset = event.target.src;
};

const replaceBlur = (event) => {
  event.target.nextElementSibling.remove();
  event.target.style.height = "auto";
  //  event.target.srcset = event.target.src;
};

const getBackground = (picture) => {
  if (!picture.blurhash) return null;

  const ratio = 8;
  const w = Math.floor(picture.width / ratio),
    h = Math.floor(picture.height / ratio);
  const pixels = decode(picture.blurhash, w, h);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(w, h);
  imageData.data.set(pixels);
  ctx.scale(ratio, ratio);
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

const makeUrl = (pic, campaignName) => {
  if (campaignName === "taxe_super_profits") {
    //TODO: remove legacy
    return (
      `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${campaignName.replace(/_/g, "-")}/public/${pic.hash}.jpg`
    );
  }

  return (
    `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/picture/${campaignName}/${pic.hash}.jpg`
  );
};

const PictureWall = (props) => {
  const classes = useStyles();
  const supabase = useSupabase();
  const [pictures, setPictures] = useState([]);
  const [selected, select] = useState(false);
  const [country, setCountry] = useState(props.country);
  const [countries, setCountries] = useState([]);
  const config = useCampaignConfig();
  const campaign = config.campaign.name.replaceAll("_", "-");
  const placeholder = usePlaceholder(600, 800);
  const handleClose = () => {
    select(false);
  };

  useEffect(() => {
    (async () => {
      if (config.component.wall.country !== true) return;
      const { data, error } = await supabase
        .from("picture_by_country")
        .select("area,total")
        .order("total", { ascending: false });
      if (error) {
        console.error(error);
        return;
      }
      setCountries(data);
    })();
  }, [config.component.wall.country, supabase]);

  useEffect(() => {
    (async () => {
      let query = supabase
        .from("pictures")
        .select("hash,legend,lang,blurhash,width,height")
        .order("id", { ascending: false })
        .eq("campaign", config.campaign.name)
        .eq("enabled", true);

      if (country && country !== "?") {
        query = query.eq("area", country);
      }
      const { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }
      setPictures(data);
    })();
  }, [country, config.campaign.name, supabase]);

  const CountrySelect = () => {
    if (config.component.wall.country !== true) return null;
    return (
      <TextField
        id="country"
        select
        variant="filled"
        label="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <MenuItem key="?" value="?">
          Choose your country
        </MenuItem>
        {countries.map((option) => (
          <MenuItem key={option} value={option} />
        ))}
      </TextField>
    );
  };
  console.log(selected);
  return (
    <>
      <Dialog
        name={selected !== false ? pictures[selected].legend : "a"}
        dialog={selected !== false}
        close={handleClose}
      >
        {selected !== false && (
          <img
            className={classes.timg}
            src={makeUrl(pictures[selected], campaign)}
            alt={pictures[selected].legend}
          />
        )}
      </Dialog>
      {false && <ProgressCounter />}
      <CountrySelect options={countries} />
      <Grid container spacing={1} justifyContent="center" alignItems="center">
        {pictures.map((d, i) => (
          <Grid key={d.hash} xs={12} sm={3} item onClick={() => select(i)}>
            <img
              className={classes.img}
              onError={(e) => setBlurhash(e, d)}
              onLoad={(e) => replaceBlur(e)}
              loading="lazy"
              src={makeUrl(d, campaign)}
              alt={d.legend}
            />
            <img
              src={getBackground(d) || placeholder}
              className={classes.bimg}
              alt={d.legend}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default PictureWall;
