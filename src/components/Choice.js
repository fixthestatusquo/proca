import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Box } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";
import { Markdown } from "@components/TTag";
import { makeStyles } from "@material-ui/core/styles";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(theme => ({
  submit: {
    width: "100%",
    marginTop: "10px",
  },
}));

const Choice = props => {
  const classes = useStyles();
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const { go } = props;

  const handleYes = () => {
    go("Message");
  };

  const handleNo = () => {
    go("Share");
  };

  const text = t(
    "campaign:choice.intro",
    "Would you like to send a message to decision makers?"
  );

  return (
    <>
      <Markdown text={text} />
      <Box className={classes.buttonContainer}>
        <Button
          endIcon={<CheckIcon />}
          className={classes.submit}
          variant="contained"
          onClick={handleYes}
          style={{ backgroundColor: config.layout.primaryColor }}
        >
          {t("Yes")}
        </Button>
        <Button
          endIcon={<CloseIcon />}
          className={classes.submit}
          variant="contained"
          onClick={handleNo}
        >
          {t("No")}
        </Button>
      </Box>
    </>
  );
};

export default Choice;
