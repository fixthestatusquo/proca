import React from "react";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import { useTranslation } from "react-i18next";
import { Button, Grid } from "@material-ui/core";
import { useCampaignConfig } from "@hooks/useConfig";
import { Markdown } from "@components/TTag";
import Country from "@components/field/Country";
import TextField from "@components/field/TextField";
import { useData } from "@hooks/useData";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import DoneIcon from "@material-ui/icons/Done";

export const useStyles = makeStyles((theme) => ({
  submit: {
    width: "100%",
    marginTop: "10px",
  },
}));

const PublicMessage = (props) => {
  const [data, setData] = useData();
  const classes = useStyles();

  const config = useCampaignConfig();
  const form = useForm();
  const { handleSubmit } = form;
  const { t } = useTranslation();

  const onSubmit = (formData, sendMessage = true) => {
   if (sendMessage) {
      setData({ ...data, ...formData });
    }
    props.done &&
      props.done({
        firstname: formData.firstname,
        country: formData.country,
        privacy: formData.privacy,
        comment: formData.comment,
      });
  };

  const text = t(
    "campaign:message.intro",
    "**Send your message** to the decision makers and show your support for the cause.",
  );
  return (
    <form id="dispatch-comment">
      <Markdown text={text} />
      <Country {...props} form={form} />
      <Grid item xs={12}>
        <TextField
          form={form}
          name="comment"
          multiline
          maxRows="10"
          label={t("Comment")}
          helperText={t("help.comment", "")}
        />
      </Grid>
      <Button
        endIcon={<DoneIcon />}
        className={classes.submit}
        variant="contained"
        onClick={handleSubmit((data) => onSubmit(data, true))}
        style={{ backgroundColor: config.layout.primaryColor }}
      >
        {t("Send message")}
      </Button>

      <Button
        endIcon={<SkipNextIcon />}
        variant="contained"
        className={classes.submit}
        onClick={handleSubmit((data) => onSubmit(data))}
      >
        {t("Skip")}
      </Button>
    </form>
  );
};

export default PublicMessage;
