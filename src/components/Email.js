
import EmailAction from "@components/email/Action";
import NonEngagement from "@components/email/NonEngagment";
import TextField from "@components/field/TextField";
import Filter from "@components/filter/Filter";
import ProgressCounter from "@components/ProgressCounter";
import Register from "@components/Register";
import { useCampaignConfig, useSetActionType } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { useIsMobile } from "@hooks/useDevice";
import { useLayout } from "@hooks/useLayout";
import { useTargetSource, useTargets } from "@hooks/useTargets";
import useToken, { extractTokens } from "@hooks/useToken";
import { getCountryName } from "@lib/i18n";
import { submitted } from "@lib/targets";
import { pickOne } from "@lib/text";
import {
  Button,
  Collapse,
  Container,
  FormHelperText,
  Grid,
  List,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Alert from "@material-ui/lab/Alert";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
  list: {
    position: "relative",
    overflow: "auto",
    maxHeight: 300,
  },
}));

const EmailComponent = props => {
  const classes = useStyles();
  const layout = useLayout();
  const config = useCampaignConfig();
  useSetActionType("mail2target");
  const [data, setData] = useData();
  const { all, visible, selected, filters, select } = useTargets();
  const selectable = !!config.component.email?.selectable;

  const listRef = useRef(null);

  // need cleanup, alswaysUpdate and blockUpdate seems to be handling the same issue (decide if the subject/message needs to be loaded or not)
  const [alwaysUpdate, setAlwaysUpdate] = useState(
    config.component.email?.filter?.multilingual === true
  );
  const [blockUpdate, setBlock] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const emailProvider = useRef(undefined); // we don't know the email provider

  const paramEmail = useMemo(
    () => ({
      subject: pickOne(t(["campaign:email.subject", "email.subject"], "")),
      message: t(["campaign:email.body", "email.body"], ""),
    }),
    [t]
  );

  //this is not a "real" MTT, ie. we aren't sending individual emails to the targets but - for instance - weekly digests
  const mttProcessing =
    config.component.email?.server !== false &&
    config.component.email?.server?.processing !== false;

  useEffect(() => {
    if (!data.subject && (paramEmail.subject || paramEmail.message)) {
      setData(paramEmail);
    }
  }, [paramEmail, setData, data.subject]);

  const form = useForm({
    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: Object.assign({}, paramEmail, data, {
      language: config.locale,
    }),
  });

  const {
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = form;

  const fields = getValues(["subject", "message"]);
  const gender = watch("gender");

  useTargetSource({ targets: props.targets, config });

  const shown = useMemo(
    () =>
      visible.filter(target =>
        Object.values(filters).every(
          filter => !filter.display || filter.display(target)
        )
      ),
    [visible, filters, selected]
  );

  useEffect(() => {
    setData("targets", shown);
  }, [shown, setData]);

  const tokenKeys = extractTokens(data.message || paramEmail.message);
  const tokens = watch(tokenKeys);
  useEffect(() => {
    if (!alwaysUpdate) {
      return;
    }
    if (fields.message === "" && paramEmail.message) {
      setValue("message", paramEmail.message);
    }
  }, [paramEmail, alwaysUpdate]);

  const handleMerging = text => {
    if (!alwaysUpdate) {
      return;
    }

    setValue("message", text);
  };

  if (tokenKeys.includes("targets")) tokens.targets = shown;

  const getDataWithToken = key => {
    // get the data (subject or message) with the gender if set and existing, for instance if the message is different for a male or female supporter, like in french or german
    //return gender ? data[`message_${gender}`] : data.message;
    return gender && data[`${key}_${gender}`]
      ? data[`${key}_${gender}`]
      : data[key];
  };

  useToken(getDataWithToken("message"), tokens, handleMerging);
  // # todo more reacty, use the returned value instead of the handleMerging callback

  const checkUpdated = () => {
    // we do not automatically update the message as soon as the user starts changing it
    setAlwaysUpdate(false);
  };
  useEffect(() => {
    if (blockUpdate) return;

    ["subject", "message"].map(k => {
      if (data[k] && (!fields[k] || alwaysUpdate)) {
        const defaultValue = form.getValues();
        if (tokenKeys.length) {
          // there are token in the message
          //          const empty = { defaultValue: data[k], nsSeparator: false };

          const empty = {
            // undo d6d36b51e6a554ed045dde4687c92a1b24a4c9e1 in next line (letters can't be edited)
            defaultValue: getDataWithToken(k) || defaultValue[k],
            nsSeparator: false,
          };
          tokenKeys.forEach(d => (empty[d] = defaultValue[d] || ""));
          empty.name = defaultValue.firstname
            ? `${defaultValue.firstname} ${defaultValue.lastname}`
            : "";
          empty.locality = defaultValue.locality || "";
          empty.signature = empty.name;
          if (empty.locality)
            empty.signature = `${empty.name}\n${empty.locality}`;
          form.setValue(k, t(getDataWithToken(k), empty));
        } else {
          form.setValue(k, getDataWithToken(k));
        }
      }
      return undefined;
    });
  }, [
    {
      firstname: tokens.firstname,
      country: tokens.country ? getCountryName(tokens.country) : "",
    },

    fields,
    tokenKeys,
    data,
    t,
    form,
    alwaysUpdate,
    blockUpdate,
  ]);
  const send = data => {
    const hrefGmail = message => {
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${message.to}&su=${message.subject}${message.cc ? `&cc=${message.cc}` : ""}${message.bcc ? `&bcc=${message.bcc}` : ""}&body=${message.body}`;
    };

    let to = [];
    let cc = null;
    let bcc = null;
    if (config.component.email?.bcc) {
      bcc = config.component.email.bcc;
      if (
        config.component.email?.bccOptout === false &&
        getValues("privacy") === "opt-out"
      ) {
        bcc = null;
      }
      if (data.bcc === false) {
        bcc = null;
      }
    }

    //const  paramEmail = {subject:t("campaign:email.subject",""),message:t("campaign:email.body","")};
    let [subject, message, comment] = getValues([
      "subject",
      "message",
      "comment",
    ]);
    if (!message) message = paramEmail.message;
    if (comment) message += `\n${comment}`;

    const profiles = getTargets();

    for (let i = 0; i < profiles.length; i++) {
      if (profiles[i].email) to.push(profiles[i].email);
    }
    to = to.join(";");

    if (config.component.email?.cc === true) {
      cc = to;
      to = null;
    }
    if (
      config.component.email?.to &&
      typeof config.component.email.to === "string"
    ) {
      to = config.component.email.to;
    }

    const url = //link to gmail compose instead of the default mailto to avoid misconfiguration if we can
      !isMobile &&
      (data.email.includes("@gmail") || emailProvider.current === "google.com")
        ? hrefGmail({
            to: to,
            subject: encodeURIComponent(subject),
            cc: cc,
            bcc: bcc,
            body: encodeURIComponent(message),
          })
        : `mailto:${to}?subject=${encodeURIComponent(subject)}${cc ? `&cc=${cc}` : ""}${bcc ? `&bcc=${bcc}` : ""}&body=${encodeURIComponent(message)}`;

    if (!to) {
      console.warn("no target, skip sending");
      return false;
    }
    if (!/^(mailto:|https:\/\/mail\.google\.com\/)/.test(url)) {
      console.error("unexpected redirect url", url);
      return false;
    }
    //var win = window.open(url, "_blank");
    window.location.assign(url);

    /*
  //TODO: display fallback using  Clipboard.writeText()
  var timer = setInterval(() => {
    if (!win) {
      addAction(config.actionPage, "email_blocked", { uuid: uuid() });
      clearInterval(timer);
      return;
    }
    if (win.closed) {
      addAction(config.actionPage, "email_close", {
        uuid: uuid(),
        //        tracking: Url.utm(),
        payload: [],
      });
      clearInterval(timer);
      props.done();
    }
  }, 1000);
*/
  };
  //    <TwitterText text={actionText} handleChange={handleChange} label="Your message to them"/>
  //

  if (!config.component.email) {
    config.component.email = {
      field: { subject: { required: true }, message: { required: true } },
    };
  } else {
    if (!config.component.email?.field) {
      config.component.email.field = {
        subject: { required: true },
        message: { required: true },
      };
    }
  }
  const ExtraFields = props => {
    return (
      <>
        {config.component.email.field.subject !== false ? (
          <Grid item xs={12} className={props.classes.field}>
            <TextField
              form={props.form}
              name="subject"
              disabled={!!config.component.email.field.subject.disabled}
              required={config.component.email.field.subject.required}
              label={t("Subject")}
              onChange={checkUpdated}
              onClick={() => {
                setBlock(true);
              }}
            />
          </Grid>
        ) : (
          <input type="hidden" {...props.form.register("subject")} />
        )}

        {config.component.email.field.message !== false ? (
          <Grid item xs={12} className={props.classes.field}>
            {config.component.email.salutation && (
              <FormHelperText variant={layout.variant}>
                <Typography variant="body1" color="textPrimary">
                  {t("email.salutation_placeholder")},
                </Typography>
                {t("email.salutation_info")}
              </FormHelperText>
            )}
            <TextField
              form={props.form}
              name="message"
              multiline
              maxRows={config.component.email.field.message.disabled ? 4 : 10}
              disabled={!!config.component.email.field.message.disabled}
              required={config.component.email.field.message.required}
              onChange={checkUpdated}
              onClick={() => {
                setBlock(true);
              }}
              label={t("Your message")}
              helperText={t("message.helper", "")}
            />
          </Grid>
        ) : (
          <input type="hidden" {...props.form.register("message")} />
        )}
        {config.component.email?.field?.comment && (
          <Grid item xs={12}>
            <TextField
              form={props.form}
              name="comment"
              multiline
              maxRows={3}
              required={config.component.email.field.comment.required}
              label={t("Comment")}
            />
          </Grid>
        )}
      </>
    );
  };

  const onClick = config.component.email?.server !== false ? null : send;

  const prepareData = data => {
    if (!data.privacy) data.privacy = getValues("privacy");
    if (!data.message) data.message = getValues("message");
    if (data.comment) data.message += `\n${data.comment}`;
    if (config.component.email?.salutation) {
      data.message = `{{target.fields.salutation}}\n${data.message}`;
    }
    if (config.component.email?.ps) {
      data.message = `${data.message}\n\n{{target.fields.ps}}`;
    }

    if (mttProcessing === false) {
      data.mttProcessing = false;
    }
    if (props.prepareData) data = props.prepareData(data);

    //add external id for prefilled widgets
    if (config.component?.email?.replace) {
      for (const key in config.component.email.replace) {
        const value = config.component.email.replace[key];
        if (data.message.includes(key))
          data.message = data.message.replace(key, value);
      }
    }
    return data;
  };

  const nonEngagement = shown.some(profile => profile.engagement === false);

  const getTargets = () => submitted(shown, selected, selectable);

  const getTargetsSubmit = () => {
    if (nonEngagement) return [];
    if (config.component.email?.server !== false) {
      return getTargets();
    }
    return null;
  };

  useEffect(() => {
    if (!selectable) return;
    if (selected.length === 0 && shown.length === 1 && !shown[0].disabled) {
      select([shown[0].procaid]);
    }
  }, [selectable, selected, shown, select]);

  let selectAllEnabled = true;
  if (
    config.import &&
    (config.import.find(d => d.startsWith("filter")) ||
      config.component.email?.filter?.includes("postcode")) &&
    shown.length > 30
  ) {
    selectAllEnabled = false;
  }

  const displayed = profile => profile.display !== false;

  if (all.length === 0) return null;

  return (
    <Container maxWidth="sm">
      {config.component.email?.counter && (
        <ProgressCounter actionPage={props.actionPage} />
      )}
      <Filter form={form} />
      {selectable && (
        <>
          <input
            type="hidden"
            {...form.register("selection", {
              validate: () => {
                selected.length > 0 && setValue("selection", selected.length);
                return selected !== 0;
              },
            })}
          />

          {selected.length === 0 && shown.length > 0 ? (
            <Alert
              severity={errors?.selection ? "error" : "info"}
              action={
                selectAllEnabled && (
                  <Button
                    color="primary"
                    size="small"
                    variant="contained"
                    onClick={() =>
                      select(
                        shown
                          .filter(target => !target.disabled)
                          .map(target => target.procaid)
                      )
                    }
                  >
                    {t("select_all", { defaultValue: "Select all" })}
                  </Button>
                )
              }
            >
              {t("target.missing", {
                defaultValue: "Select at least one out of {{total}}",
                total: shown.length,
              })}
            </Alert>
          ) : (
            selected.length >= 1 && (
              <Alert severity="success">
                {t("target.selected", {
                  defaultValue: "{{total}} selected",
                  total: selected.length,
                })}
              </Alert>
            )
          )}
        </>
      )}
      {nonEngagement && <NonEngagement />}
      {config.component.email?.showTo !== false && (
        <List className={classes.list} dense ref={listRef} component="div">
          {shown.map((d, i) => (
            <EmailAction
              key={d.procaid || d.id || i}
              actionPage={config.actionPage}
              done={props.done}
              display={displayed(d)}
              disabled={d.disabled}
              actionUrl={props.actionUrl || data.actionUrl}
              actionText={t(["campaign:share.twitter", "campaign:share"])}
              profile={d}
              selection={selectable ? selected : false}
              setSelection={select}
            />
          ))}
        </List>
      )}
      <Collapse
        in={shown.length > 0 || config.component.email?.server !== false}
      >
        <Register
          form={form}
          emailProvider={emailProvider}
          done={props.done}
          buttonText={t(config.component.register?.button || "action.email")}
          targets={getTargetsSubmit()}
          beforeSubmit={prepareData}
          onClick={onClick}
          extraFields={ExtraFields}
        />
      </Collapse>
    </Container>
  );
};

export default EmailComponent;
