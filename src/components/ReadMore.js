import React, { useState } from "react";

import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import TTag, { Markdown } from "@components/TTag";
import Dialog from "@components/Dialog";
import { truncate } from "@lib/text";
//import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import MoreIcon from "@material-ui/icons/MoreHoriz";

const ReadMore = (props) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Dialog
        dialog={open}
        close={() => setOpen(false)}
        name={t("campaign:title")}
      >
        <TTag message={props.message} />
      </Dialog>
      <Markdown text={truncate(t(props.message), props.length)} />
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        endIcon={<MoreIcon />}
      >
        {t("read more")}
      </Button>
    </>
  );
};

export default ReadMore;
