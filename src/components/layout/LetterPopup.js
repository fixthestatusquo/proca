import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

import { Button } from "@material-ui/core";

import { snarkdown } from "@components/TTag";
import Dialog from "@components/Dialog";
//import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import MoreIcon from "@material-ui/icons/MoreHoriz";

const ReadMore = () => {
  const config = useCampaignConfig();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(undefined);
  const { t } = useTranslation();
  useEffect(() => {
    let isCancelled = false;
    if (!open) return;

    (async function () {
      let url =
        "https://" + config.campaign.name + ".proca.app/" + config.locale;

      let d = null;
      let json = null;
      try {
        d = await fetch(url).catch(e => {
          setText(e.message);
        });
      } catch {
        console.log("no message in", lang);
      }
      if (!d) return;
      try {
        json = await d.json();
      } catch {
        console.log("no message in", lang);
        return;
      }
      if (!isCancelled) {
        setText(json.message);
      }
      return null;
    })();

    return () => {
      isCancelled = true;
    };
  }, [config.locale, open, config.campaign.name]);

  return (
    <>
      <Dialog
        dialog={open}
        close={() => setOpen(false)}
        name={t("campaign:title")}
      >
        <div dangerouslySetInnerHTML={{ __html: text && snarkdown(text) }} />
      </Dialog>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setOpen(true)}
        endIcon={<MoreIcon />}
      >
        {t("read more")}
      </Button>
    </>
  );
};

export default ReadMore;
