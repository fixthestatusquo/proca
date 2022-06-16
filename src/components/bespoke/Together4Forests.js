import React from "react";

import { FormControlLabel, InputLabel } from "@material-ui/core";
import { useTranslation, Trans } from "react-i18next";

import CreateMeme from "./meme/CreateMeme";
//import SelectMeme from "./meme/Select";

const Together4Forests = (props) => {
  const { t } = useTranslation();
  return (
    <div>
      <InputLabel>{t("campaign:meme.explain")}</InputLabel>
      <CreateMeme form={props.form} />
    </div>
  );
};

export default Together4Forests;
