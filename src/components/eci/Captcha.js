import React, { useState, useEffect } from "react";
//import parse from 'html-react-parser';
import { Grid, Box } from "@material-ui/core";
import TextField from "../TextField";
import { useTranslation } from "react-i18next";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import ReplayIcon from "@material-ui/icons/Replay";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  captcha: {
    backgroundColor: theme.palette.background.paper,
    "& path": {
      stroke: theme.palette.primary.light,
      fill: theme.palette.primary.main,
      filter: "drop-shadow( 2px 2px 1px rgba(0, 0, 0, .4))",
    },
    "& path.n": {
      strokeWidth: 3,
      filter: "none",
      fill: "none",
      stroke: theme.palette.primary.light,
    },
  },
}));

export default function Captcha(props) {
  const [captcha, setCaptcha] = useState(null);
  const classes = useStyles();
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  const { setValue } = props.form;

  const compact = props.compact || false;
  useEffect(() => {
    let isLive = true;
    (async () => {
      fetch("https://captcha.proca.app")
        .then((response) => response.json())
        .then((captcha) => isLive && setCaptcha(captcha));
    })();
    return () => (isLive = false);
  }, [count]);

  const handleClick = () => {
    setCount(count + 1);
    setValue("captcha", "");
    //    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  const Svg = () => {
    if (!captcha) return null;
    return (
      <svg
        className={classes.captcha}
        viewBox={"0,0," + captcha.width + "," + captcha.height}
      >
        {captcha.d.map((d, i) => (
          <path className={i === 0 ? "n" : null} key={i} d={d} />
        ))}
      </svg>
    );
  };

  //  return parse(captcha.data);
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={compact ? 7 : 7}>
          <TextField
            form={props.form}
            name="captcha"
            helperText={t("eci:form.captcha-image-title")}
            label=""
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={t("eci:form.captcha-button-arialabel-refresh")}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                  >
                    <ReplayIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
          />
        </Grid>
        <Grid item xs={compact ? 5 : 5}>
          <Box py={1}>
            <Svg />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
