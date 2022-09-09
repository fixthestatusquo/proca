import React, { useState } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import EmailField from "@components/field/Email";
import SendIcon from "@material-ui/icons/Send";
import Dialog from "@components/Dialog";
import { useForm } from "react-hook-form";
import { Button, Box } from "@material-ui/core";
import uuid, { isSet as isUuid } from "@lib/uuid.js";
import { useTranslation } from "react-i18next";
import { addActionContact } from "@lib/server.js";
import RemindIcon from "@material-ui/icons/AccessAlarms";
import { ConsentProcessing } from "@components/Consent";

const RemindMeLater = (props) => {
  const config = useCampaignConfig();
  const [data] = useData();
  const { t } = useTranslation();
  const [displayed, setDisplayed] = useState(false);
  //if (!config.component.reminder) return null;
  const form = useForm({
    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: data,
  });
  const { handleSubmit, setError, formState } = form;
  const onSubmit = async (formData) => {
    console.log("on submit");
    /*    if (emailProvider.current === false) {
      setError("email", {
        type: "mx",
        message: t("email.invalid_domain", {
          defaultValue: "{{domain}} cannot receive emails",
          domain: getDomain(formData.email),
        }),
      });
      // the email domain is checked and invalid
      return false;
    } else {
      if (emailProvider.current) formData.emailProvider = emailProvider.current;
    }

    formData.tracking = Url.utm(config.component?.register?.tracking);
*/
    formData.privacy = "";
    if (!formData) {
      console.error("missing data");
      return false;
    }

    if (isUuid()) {
      // they were previous actions, we associate them with the contact recorded now
      formData.uuid = uuid();
    }

    if (data.uuid) {
      // the contact is known, but the contact details possibly not set
      formData.uuid = data.uuid;
    }
    const payload = {
      firstname: data.firstname || "-",
      email: formData.email,
    };

    const result = await addActionContact(
      "reminder",
      config.actionPage,
      payload,
      config.test
    );

    if (result.errors) {
      let handled = false;
      if (result.errors.fields) {
        result.errors.fields.forEach((field) => {
          if (field.name in formData) {
            setError(field.name, { type: "server", message: field.message });
            handled = true;
          } else if (field.name.toLowerCase() in formData) {
            setError(field.name.toLowerCase(), {
              type: "server",
              message: field.message,
            });
            handled = true;
          }
        });
      }

      !handled &&
        setError("email", {
          type: "server",
          message: "fatal error, please try later",
        });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
      style={{ width: "100%" }}
    >
      <Button
        variant="contained"
        fullWidth
        onClick={() => setDisplayed(true)}
        endIcon={<RemindIcon />}
      >
        {t("action.reminder", "Remind me later")}
      </Button>
      <Dialog dialog={displayed} close={() => setDisplayed(false)}>
        <p>
          {t(
            "reminder.intro",
            "We know, your government is asking a lot of information. We will send you a single email to remind you to fill it later"
          )}
        </p>
        <EmailField form={form} />
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          endIcon={<SendIcon />}
          size="large"
          disabled={formState.isSubmitting}
        >
          {t("action.reminderEmail", "Remind me by email")}
        </Button>
        <Box mt={2}>
          <ConsentProcessing />
        </Box>
      </Dialog>
    </form>
  );
};
export default RemindMeLater;
