import React, { useState, useEffect } from "react";
//import parse from 'html-react-parser';
import { Grid, Box } from "@material-ui/core";
import TextField from "../TextField";
import { useTranslation } from "react-i18next";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import ReplayIcon from "@material-ui/icons/Replay";

export default function Captcha(props) {
  const [captcha, setCaptcha] = useState({ data: "" });
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  const { setValue } = props.form;

  const compact = true;
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

  //  return parse(captcha.data);
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={compact ? 6 : 7}>
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
        <Grid item xs={compact ? 6 : 5}>
          <Box py={1} dangerouslySetInnerHTML={{ __html: captcha.data }} />
        </Grid>
      </Grid>
    </>
  );
}
