import React, { useState } from "react";

import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

import TTag, { Markdown } from "@components/TTag";
import Dialog from "@components/Dialog";
import { truncate } from "@lib/text";
//import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreIcon from "@mui/icons-material/MoreHoriz";

const ReadMore = (props) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <Box id="proca-block" boxShadow={2} p={2}>
      <Dialog
        dialog={open}
        close={() => setOpen(false)}
        name={t("campaign:title")}
      >
        <TTag message={props.message} />
      </Dialog>
      <Markdown text={truncate(t(props.message), props.length)} />
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          endIcon={<MoreIcon />}
        >
          {t("read more")}
        </Button>
      </Box>
    </Box>
  );
};

export default ReadMore;
