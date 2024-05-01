import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

import {
  Button,
  Collapse,
  List,
  FilledInput,
  FormHelperText,
  FormControl,
} from "@material-ui/core";

import Alert from "@material-ui/lab/Alert";

import EmailAction from "@components/email/Action";
import SkeletonListItem from "@components/layout/SkeletonListItem";
import ProgressCounter from "@components/ProgressCounter";
import Filter from "@components/filter/Filter";

import useData from "@hooks/useData";
import useToken, { extractTokens } from "@hooks/useToken";
import { useIsMobile } from "@hooks/useDevice";
import { sample } from "@lib/array";
import Register from "@components/Register";
import { useTranslation } from "react-i18next";
import { useCampaignConfig, useSetCampaignConfig } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { Grid, Container } from "@material-ui/core";
import TextField from "@components/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { mainLanguage } from "@lib/i18n";
import { getCountryName } from "@lib/i18n";
import { pickOne } from "@lib/text";

const useStyles = makeStyles(() => ({
  list: {
    position: "relative",
    overflow: "auto",
    maxHeight: 300,
  },
}));

const EmailComponent = (props) => {
  const classes = useStyles();
  const config = useCampaignConfig();
  const setConfig = useSetCampaignConfig();
  const [profiles, setProfiles] = useState(props.targets || []);
  const [selection, _setSelection] = useState(
    config.component.email?.selectable ? [] : false,
  );
  const listRef = useRef(null);

  const setSelection = (selection) => {
    _setSelection(selection);
  };
  const selectAll = () => {
    const r = profiles.map((target) => target.procaid);
    _setSelection(r);
  };

  const [data, setData] = useData();
  //  const [filter, setFilter] = useState({country:null});
  const [allProfiles, setAllProfiles] = useState(props.targets || []);
  const [languages, setLanguages] = useState([]);

  // need cleanup, alswaysUpdate and blockUpdate seems to be handling the same issue (decide if the subject/message needs to be loaded or not)
  const [alwaysUpdate, setAlwaysUpdate] = useState(
    config.component.email?.multilingual === true,
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
    [t],
  );

  //this is not a "real" MTT, ie. we aren't sending individual emails to the targets but - for instance - weekly digests
  const mttProcessing =
    config.component.email?.server !== false &&
    config.component.email?.server?.processing !== false;
  const fallbackRandom = config.component.email?.fallbackRandom;
  const fallbackArea = config.component.email?.fallbackArea;
  const countryFiltered = config.component.email?.filter?.includes("country");
  const postcodeFiltered = config.component.email?.filter?.includes("postcode");
  const localeFiltered =
    config.component.email?.filter?.includes("multilingual");
  const sampleSize = config.component.email?.sample || 1;
  const locale = config.locale;

  useEffect(() => {
    if (!props.targets) return;
    setProfiles(props.targets);
  }, [props.targets]);

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
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const country = watch("country");
  const fields = getValues(["subject", "message"]);
  const [constituency, postcode, area] = watch([
    "constituency",
    "postcode",
    "area",
  ]);

  const tokenKeys = extractTokens(data["message"] || paramEmail.message);
  const tokens = watch(tokenKeys);
  useEffect(() => {
    if (!alwaysUpdate) {
      return;
    }
    if (fields.message === "" && paramEmail.message) {
      setValue("message", paramEmail.message);
    } // eslint-disable-next-line
  }, [paramEmail, alwaysUpdate]);

  const handleMerging = (text) => {
    if (!alwaysUpdate) {
      return;
    }

    setValue("message", text);
  };

  if (tokenKeys.includes("targets")) tokens.targets = profiles;

  useToken(data["message"], tokens, handleMerging);
  // # todo more reacty, use the returned value instead of the handleMerging callback

  const checkUpdated = () => {
    // we do not automatically update the message as soon as the user starts changing it
    setAlwaysUpdate(false);
  };
  useEffect(() => {
    if (blockUpdate) return;

    ["subject", "message"].map((k) => {
      if (data[k] && (!fields[k] || alwaysUpdate)) {
        const defaultValue = form.getValues();
        if (tokenKeys.length) {
          // there are token in the message
          //          const empty = { defaultValue: data[k], nsSeparator: false };

          const empty = {
            // undo d6d36b51e6a554ed045dde4687c92a1b24a4c9e1 in next line (letters can't be edited)
            defaultValue: data[k] || defaultValue[k],
            nsSeparator: false,
          };
          tokenKeys.forEach((d) => (empty[d] = defaultValue[d] || ""));
          empty.name = defaultValue.firstname
            ? defaultValue.firstname + " " + defaultValue.lastname
            : "";
          if (empty.locality) {
            empty.name += "\n" + empty.locality;
          }
          form.setValue(k, t(data[k], empty));
        } else {
          form.setValue(k, data[k]);
        }
      }
      return undefined;
    });
  }, [
    // eslint-disable-next-line
    {
      firstname: tokens.firstname,
      country: tokens.country ? getCountryName(tokens.country) : "",
    },
    // eslint-disable-next-line
    fields,
    tokenKeys,
    data,
    t,
    form,
    alwaysUpdate,
    blockUpdate,
  ]);
  // todo: clean the dependency
  //
  useEffect(() => {
    const fetchData = async (url) => {
      await fetch(url)
        .then((res) => {
          if (!res.ok) throw res.error();
          return res.json();
        })
        .then((d) => {
          let languages = [];
          if (config.hook && typeof config.hook["target:load"] === "function") {
            d = config.hook["target:load"](d);
          }
          d.forEach((c) => {
            if (c.locale && !languages.includes(c.locale)) {
              languages.push(c.locale);
            }
            if (c.country) c.country = c.country.toLowerCase();
          });
          setAllProfiles(d);
          setLanguages(languages);
          if (!config.component.email?.filter?.includes("country")) {
            setProfiles(d);
          }
          if (postcodeFiltered) {
            setProfiles([]);
          }
          if (config.component.email?.filter?.includes("random")) {
            if (!config.component.email.sample) {
              const i = d[Math.floor(Math.random() * d.length)];
              setProfiles([i]);
            } else {
              const shuffled = d.sort(() => 0.5 - Math.random()); // biased, but good enough
              setProfiles(shuffled.slice(0, config.component.email.sample));
            }
          }
        })
        .catch((error) => {
          const placeholder = {
            name: error.toString(),
            description: "Please check your internet connection and try later",
          };
          setProfiles([placeholder]);
          setAllProfiles([placeholder]);
        });
    };
    if (!config.component.email?.to) {
      const url =
        typeof config.component.email?.listUrl === "string"
          ? config.component.email.listUrl
          : "https://widget.proca.app/t/" + config.campaign.name + ".json";

      fetchData(url);
    } else {
      const emails =
        typeof config.component.email?.to === "string"
          ? config.component.email.to?.split(",")
          : [];
      let to = [];
      emails.forEach((d) => {
        return to.push({ email: d.trim() });
      });
      if (to.length == 0) return;
      setAllProfiles(to);
      setProfiles(to);
    } // eslint-disable-next-line
  }, [config.component, config.hook, setAllProfiles]);

  const filterLocale = useCallback(
    (locale) => {
      if (!locale) {
        return [];
      }
      let d = allProfiles.filter((d) => {
        //      console.log(d.area === area && d.constituency === -1,d.area,d.constituency,area);
        return d.locale === locale;
      });
      setProfiles(d);
      setData("targets", d);
      setConfig((current) => {
        let next = { ...current };
        next.lang = locale;
        return next;
      });

      return d;
    },
    [allProfiles, setConfig, setData],
  );

  const filterArea = useCallback(
    (area) => {
      if (!area) {
        return [];
      }
      let d = allProfiles.filter((d) => {
        //      console.log(d.area === area && d.constituency === -1,d.area,d.constituency,area);
        return d.area === area && d.constituency === -1;
      });
      if (d.length === 0) {
        d = sample(allProfiles, sampleSize || fallbackRandom);
      }
      return d;
    },
    [sampleSize, fallbackRandom, allProfiles],
  );

  const filterProfiles = useCallback(
    (country, constituency, area) => {
      if (constituency || area) {
        country = country || "?";
      }
      if (!country || typeof country !== "string") return;
      if (allProfiles.length === 0) return; //profiles aren't loaded yet
      country = country.toLowerCase();

      let lang = undefined;
      let d = allProfiles.filter((d) => {
        if (constituency) {
          if (typeof constituency === "object") {
            return constituency.includes(d.constituency);
          }
          return d.constituency === constituency;
        }

        if (d.lang && d.country === country) {
          if (lang === undefined) {
            lang = d.lang;
          } else {
            if (d.lang !== lang) {
              lang = false;
            }
          }
        }
        return (
          d.country === country ||
          d.country === "" ||
          d.constituency?.country === country
        );
      });

      if (!lang && localeFiltered) {
        // more than one lang in the country
        if (languages.includes(locale)) {
          lang = locale;
        } else {
          lang = mainLanguage(country, false);
        }
        d = allProfiles.filter(
          (d) =>
            (d.locale ? d.locale === locale : true) && d.country === country,
        );
      }
      if (d.length === 0 && fallbackArea) {
        console.log("fallback area");
        d = filterArea(area);
      }
      if (d.length === 0 && fallbackRandom && !fallbackArea) {
        d = sample(allProfiles, sampleSize || fallbackRandom);
      }
      if (d.length === 0 && postcodeFiltered && (!!constituency || !!area)) {
        setError("postcode", {
          message: t("target.postcode.empty", {
            defaultValue: "there is no-one to contact in {{area}}",
            area: area || postcode,
          }),
          type: "no_empty",
        });
      }

      if (d.length === 0 && countryFiltered) {
        setError("country", {
          message: t("target.country.empty", {
            country: getCountryName(country),
          }),
          type: "warning",
        });
      }
      if (d.length > 0) {
        clearErrors("country");
        clearErrors("postcode");
      }
      //if (lang && config.lang !== lang) {
      if (lang && typeof lang === "string") {
        setConfig((current) => {
          let next = { ...current };
          next.lang = lang || "en";
          return next;
        });
      }
      setProfiles(d);
      setData("targets", d);
      if (countryFiltered) {
        setData("country", country);
      }
    },
    [
      allProfiles,
      setProfiles,
      setError,
      clearErrors,
      t,
      setData,
      fallbackRandom,
      fallbackArea,
      filterArea,
      sampleSize,
      setConfig,
      localeFiltered,
      countryFiltered,
      postcodeFiltered,
      postcode,
      languages,
      locale,
    ],
  );

  useEffect(() => {
    if (!countryFiltered) return;
    filterProfiles(country);
  }, [country, filterProfiles, countryFiltered]);

  useEffect(() => {
    if (!postcodeFiltered) return;
    filterProfiles(country, constituency, area);
  }, [country, constituency, area, filterProfiles, postcodeFiltered]);

  useEffect(() => {
    if (!localeFiltered) return;
    filterLocale(locale);
  }, [filterLocale, localeFiltered, locale]);

  const send = (data) => {
    const hrefGmail = (message) => {
      return (
        "https://mail.google.com/mail/?view=cm&fs=1&to=" +
        message.to +
        "&su=" +
        message.subject +
        (message.cc ? "&cc=" + message.cc : "") +
        (message.bcc ? "&bcc=" + message.bcc : "") +
        "&body=" +
        message.body
      );
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
    if (comment) message += "\n" + comment;

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
        : "mailto:" +
          to +
          "?subject=" +
          encodeURIComponent(subject) +
          (cc ? "&cc=" + cc : "") +
          (bcc ? "&bcc=" + bcc : "") +
          "&body=" +
          encodeURIComponent(message);

    if (!to) {
      console.warn("no target, skip sending");
      return false;
    }
    //var win = window.open(url, "_blank");
    window.location.href = url;

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

  const ExtraFields = (props) => {
    return (
      <>
        {config.component.email?.field?.subject ? (
          <Grid item xs={12} className={props.classes.field}>
            <TextField
              form={props.form}
              name="subject"
              disabled={!!config.component.email.field.subject.disabled}
              required={config.component.email?.field?.subject?.required}
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

        {config.component.email?.field?.message ? (
          <Grid item xs={12} className={props.classes.field}>
            {config.component.email.salutation && (
              <FormControl fullWidth>
                <FilledInput
                  fullWidth={true}
                  placeholder={t("email.salutation_placeholder") + ","}
                  readOnly
                />
                <FormHelperText>{t("email.salutation_info")}</FormHelperText>
              </FormControl>
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

  const prepareData = (data) => {
    if (!data.privacy) data.privacy = getValues("privacy");
    if (!data.message) data.message = getValues("message");
    if (data.comment) data.message += "\n" + data.comment;
    if (config.component.email?.salutation) {
      data.message = "{{target.fields.salutation}},\n" + data.message;
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

  const getTargets = () => {
    if (!selection) return profiles;
    const filtered = profiles.filter((d) => selection.includes(d.procaid));
    if (filtered.length === 0 && selection.length > 0) {
      // edge case: the postcode changed without properly resetting the selection
      setSelection([]);
    }
    return filtered;
  };

  const filterTarget = useCallback(
    (key, value) => {
      //const filterTarget = (key, value) => {
      if (typeof key === "function") {
        // filter done from the filter component, eg. filter/Profile
        const d = key(allProfiles);
        if (typeof d === "object" && d.filter === "description") {
          _setSelection((prev) => {
            let first = null;
            const selection = new Set(prev);
            profiles
              .filter((target) => target.description === d.key)
              .forEach((target) => {
                if (d.value) {
                  if (!first) first = target.procaid;
                  // Add the procaid to the selection if the profile matches the filter
                  selection.add(target.procaid);
                } else {
                  // Remove the procaid from the selection if the profile does not match the filter
                  selection.delete(target.procaid);
                }
              });
            if (first) {
              scrollToItem(first);
            } else {
              scrollToFirst(selection);
            }
            return Array.from(selection);
          });
        }
        if (Array.isArray(d)) {
          console.log("filter from array");
          //        setProfiles (d);
          _setSelection((prev) => {
            const selection = [...prev];
            console.log(prev);
            //return prev; debug
            const index = 0;
            //      select(index === -1);
            if (index > -1) {
              selection.splice(index, 1);
            } else {
              selection.push(key);
            }
            return selection;
          });
        }
        return;
      }
      const d = allProfiles.filter((d) => {
        return d.fields[key] === value;
      });

      if (d.length === 0) {
        setError(key, {
          message: t("target.country.empty", {
            country: value,
          }),
          type: "no_empty",
        });
      } else {
        clearErrors(key);
      }
      console.log("filter profiles");
      setProfiles(d);
    },
    [allProfiles, profiles, setError],
  );

  if (selection.length === 0 && profiles.length === 1) {
    // if only one, select it. needs to be put in an useEffect?
    selectAll();
  }

  let selectAllEnabled = true;
  if (
    config.import &&
    config.import.includes("filter/Party") &&
    profiles.length > 30
  ) {
    selectAllEnabled = false;
  }

  const scrollToItem = (key) => {
    if (!listRef.current) return;
    const itemElement = listRef.current.querySelector(`[data-key="${key}"]`);
    if (!itemElement) return;

    const listRect = listRef.current.getBoundingClientRect();
    const itemRect = itemElement.getBoundingClientRect();
    const scrollTop = itemRect.top - listRect.top + listRef.current.scrollTop;

    // Use smoothscroll to scroll the list element
    listRef.current.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  };

  const scrollToFirst = (selection) => {
    const first = profiles.find((d) => {
      return selection.has(d.procaid);
    });
    if (first) {
      scrollToItem(first.procaid);
    } else {
      scrollToItem(profiles[0]?.procaid);
    }
  };

  return (
    <Container maxWidth="sm">
      {config.component.email?.counter && (
        <ProgressCounter actionPage={props.actionPage} />
      )}
      <Filter
        profiles={profiles}
        form={form}
        selecting={filterTarget}
        country={country}
        constituency={constituency}
        languages={languages}
        filterLocale={filterLocale}
      />
      {selection && (
        <>
          <input
            type="hidden"
            {...form.register("selection", {
              validate: () => {
                selection.length > 0 && setValue("selection", selection.length);
                return selection !== 0;
              },
            })}
          />

          {selection.length === 0 && profiles.length > 0 ? (
            <Alert
              severity={errors?.selection ? "error" : "info"}
              action={
                selectAllEnabled && (
                  <Button
                    color="primary"
                    size="small"
                    variant="contained"
                    onClick={() => selectAll()}
                  >
                    {t("select_all", { defaultValue: "Select all" })}
                  </Button>
                )
              }
            >
              {t("target.missing", {
                defaultValue: "Select at least one out of {{total}}",
                total: profiles.length,
              })}
            </Alert>
          ) : (
            selection.length >= 1 && (
              <Alert severity="success">
                {t("target.selected", {
                  defaultValue: "{{total}} selected",
                  total: selection.length,
                })}
              </Alert>
            )
          )}
        </>
      )}
      {config.component.email?.showTo !== false && (
        <List className={classes.list} dense ref={listRef}>
          {profiles.length === 0 &&
            !config.component.email?.filter?.includes("postcode") &&
            !constituency && <SkeletonListItem />}
          {profiles.map((d, i) => (
            <EmailAction
              key={d.procaid || d.id || i}
              actionPage={config.actionPage}
              done={props.done}
              display={d.display}
              actionUrl={props.actionUrl || data.actionUrl}
              actionText={t(["campaign:share.twitter", "campaign:share"])}
              profile={d}
              selection={selection}
              setSelection={setSelection}
            ></EmailAction>
          ))}
        </List>
      )}
      <Collapse
        in={profiles.length > 0 || config.component.email?.server !== false}
      >
        <Register
          form={form}
          emailProvider={emailProvider}
          done={props.done}
          buttonText={t(config.component.register?.button || "action.email")}
          targets={
            config.component.email?.server !== false ? getTargets() : null
          }
          beforeSubmit={prepareData}
          onClick={onClick}
          extraFields={ExtraFields}
        />
      </Collapse>
    </Container>
  );
};

export default EmailComponent;
