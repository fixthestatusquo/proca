import React, { useState, useEffect } from "react";
//import parse from 'html-react-parser';
import { Grid, Box, Button } from "@material-ui/core";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import IconButton from "@material-ui/core/IconButton";
import PlayIcon from "@material-ui/icons/RecordVoiceOver";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import InputAdornment from "@material-ui/core/InputAdornment";
import ReplayIcon from "@material-ui/icons/Replay";
import { makeStyles } from "@material-ui/core/styles";
import dispatch from "@lib/event";
import { useCampaignConfig } from "@hooks/useConfig";

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
  const config = useCampaignConfig();
  const [captcha, setCaptcha] = useState(null);
  const [isFocussed, setFocussed] = useState(false);
  const classes = useStyles();
  const [count, setCount] = useState(0);
  const [audioCaptcha, _setAudioCaptcha] = useState(false);
  const withAudioCaptcha = config.component.captcha?.audio !== false;
  const { t } = useTranslation();
  const { setValue, errors } = props.form;

  const compact = props.compact || false;

  const setAudioCaptcha = (audio) => {
    _setAudioCaptcha(audio);
    props.onChange({ ...captcha, audio: audio });
  };
  const update = (captcha) => {
    setCaptcha(captcha);

    captcha.count = count;
    props.onChange(captcha);
  };

  useEffect(() => {
    if (errors.captcha) {
      dispatch("input_error", {
        type: "captcha",
        count: count + 1,
        message: errors.captcha.message,
      });
    }
    if (!errors.captcha) return;
    //    setCount((c) => c + 1);
    setFocussed(true);
    //    setValue("captcha", "");
  }, [errors.captcha]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isLive = true;
    (async () => {
      fetch(config.component.eci?.captcha || "https://captcha.proca.app")
        .then((response) => response.json())
        .then((captcha) => isLive && update(captcha));
    })();
    return () => (isLive = false);
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const handlePlay = () => {
    var audio = document.getElementById("audio");
    audio.play();
  };

  return (
    <>
      <Grid container spacing={1}>
        {audioCaptcha && (
          <Grid item xs={12}>
            <audio
              id="audio"
              src="https://sign.fossilfreerevolution.org/d/audiocaptcha.mp3"
            />
            <Grid>
              <Button
                variant="contained"
                onClick={() => setAudioCaptcha(false)}
                size="small"
                aria-label={t("eci:form.captcha-button-arialabel-image")}
              >
                {t("eci:form.captcha-button-arialabel-image")}
              </Button>
            </Grid>
            <TextField
              form={props.form}
              label={t("eci:form.captcha-audio-download")}
              name="captcha"
              required
              InputProps={{
                "aria-label": t("eci:form.captcha-audio-download") + ": MAMA",
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t(
                        "eci:form.captcha-button-arialabel-refresh"
                      )}
                      onClick={handlePlay}
                    >
                      <PlayCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        {!audioCaptcha && (
          <>
            <Grid item xs={compact ? 12 : 6}>
              <TextField
                form={props.form}
                name="captcha"
                label="Captcha"
                helperText={errors.captcha && t("eci:form.captcha-image-title")}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t(
                          "eci:form.captcha-button-arialabel-refresh"
                        )}
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
            <Grid item xs={compact ? 11 : 5}>
              <Box py={1} className={isFocussed ? classes.focus : null}>
                <Svg />
              </Box>
            </Grid>
            {withAudioCaptcha && (
              <Grid item xs={1}>
                <IconButton
                  aria-label={t("eci:form.captcha-button-arialabel-audio")}
                  onClick={() => setAudioCaptcha(true)}
                >
                  <PlayIcon />
                </IconButton>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </>
  );
}
