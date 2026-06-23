import React, { useState } from "react";

import { Box, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { Markdown } from "@components/TTag";
import Dialog from "@components/Dialog";
//import { truncate } from "@lib/text";
//import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import MoreIcon from "@material-ui/icons/MoreHoriz";
//import { useCampaignConfig } from "@hooks/useConfig";

const ReadMore = ({ dangerouslySet }) => {
  //  const config = useCampaignConfig();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <Box className="proca-intro" py={2}>
      <Dialog
        dialog={open}
        close={() => setOpen(false)}
        name={t("campaign:title")}
      >
        <Markdown
          text={t("campaign:description", "")}
          dangerouslySet={dangerouslySet}
        />
      </Dialog>
      <Markdown
        text={t("campaign:intro", "")}
        dangerouslySet={dangerouslySet}
      />
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          size="small"
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
