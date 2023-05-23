import React from "react";
import { Button } from "@material-ui/core";
import ReloadIcon from "@material-ui/icons/Cached";
import NextIcon from "@material-ui/icons/SkipNext";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";

export const Next = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  return (
    <Button
      variant="contained"
      fullWidth
      onClick={props.done}
      endIcon={<NextIcon />}
    >
      {
        /* i18next-extract-disable-line */ t(
          config.component.twitter?.next
            ? config.component.twitter.next
            : "Next"
        )
      }
    </Button>
  );
};

const Again = (props) => {
  const { t } = useTranslation();
  const replay = props.again || (() => window.proca.go("Register"));
  return (
    <>
      <p>{t("Thank you")}!</p>
      <p>{t("twitter.choice", "What would you like to do next?")}</p>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        endIcon={<ReloadIcon />}
        onClick={replay}
      >
        {t("twitter.again", "Tweet to another person")}
      </Button>
      <Next done={props.done} />
    </>
  );
  //success
  //would you like to write another tweet to a new target?
  //[yes]/[no]
  //register
  //
};

export default Again;
