import React, { useState } from "react";

import { Button } from "@mui/material";
import { useTranslation } from "./hooks/useEciTranslation";

import TTag from "@components/TTag";
import Dialog from "@components/Dialog";
import Details from "./Details";
import { scrollTo } from "@lib/scroll";
//import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreIcon from "@mui/icons-material/MoreHoriz";

const ReadMore = () => {
  const [open, setOpen] = useState(false);
  const [details, showDetails] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Dialog
        dialog={open}
        close={() => setOpen(false)}
        name={t("eci:common.head-title.home")}
      >
        <h1>{t("campaign:title")}</h1>
        <TTag message="campaign:description" />
        {!details && (
          <Button
            variant="contained"
            onClick={() => scrollTo("#eci-details") || showDetails(true)}
          >
            {t("eci:common.more_info")}
          </Button>
        )}
        {details && <Details />}
      </Dialog>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => setOpen(true)}
        endIcon={<MoreIcon />}
      >
        {t("eci:howsupport.s1_text")}
      </Button>
    </>
  );
};

export default ReadMore;
