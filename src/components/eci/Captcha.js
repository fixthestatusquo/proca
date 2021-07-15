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
  focus: {
    "& svg": {
      backgroundColor: "rgba(0, 0, 0, 0.09)",
      transition: theme.transitions.create(["background-color", "transform"], {
        duration: theme.transitions.duration.complex,
      }),
      "& path.n": {
        strokeWidth: 2,
        filter: "none",
        fill: "none",
        stroke: "rgba(0, 0, 0, 0.13)",
      },
    },
  },
  captcha: {
    backgroundColor: theme.palette.background.paper,
    "& path": {
      stroke: theme.palette.primary.light,
      fill: theme.palette.primary.main,
      filter: "drop-shadow( 2px 1px 1px rgba(0, 0, 0, .4))",
    },
    "& path.n": {
      strokeWidth: 3,
      filter: "none",
      fill: "none",
      stroke: theme.palette.primary.main,
    },
  },
}));

export default function Captcha(props) {
  const [captcha, setCaptcha] = useState(null);
  const [isFocussed, setFocussed] = useState(false);
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
        .then(
          (captcha) => isLive && setCaptcha(captcha) && props.onChange(captcha)
        );
    })();
    return () => (isLive = false);
  }, [count]);

  const handleClick = () => {
    setCount(count + 1);
    setFocussed(true);
    setValue("captcha", "");
    //    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseOver = (event) => {
    setFocussed(true);
  };
  const handleMouseLeave = (event) => {
    setFocussed(false);
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  const handleFocus = (event) => {
    setFocussed(true);
  };
  const handleBlur = (event) => {
    setFocussed(false);
  };

  const Svg = () => {
    if (!captcha) return null;
    return (
      <svg
        className={classes.captcha}
        viewBox={"0,0," + captcha.width + "," + (captcha.height + 17)}
      >
        {captcha.d.map((d, i) => (
          <path className={d.startsWith("M19 84") ? "n" : null} key={i} d={d} />
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
            onFocus={handleFocus}
            onBlur={handleBlur}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={t("eci:form.captcha-button-arialabel-refresh")}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    onMouseOver={handleMouseOver}
                    onMouseLeave={handleMouseLeave}
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
          <Box py={1} className={isFocussed ? classes.focus : null}>
            <Svg />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
