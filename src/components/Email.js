import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

import {
  Collapse,
  List,
  IconButton,
  InputAdornment,
  FilledInput,
  FormHelperText,
  FormControl,
} from "@material-ui/core";

import EmailAction from "@components/email/Action";
import SkeletonListItem from "@components/layout/SkeletonListItem";
import ProgressCounter from "@components/ProgressCounter";
import SearchIcon from "@material-ui/icons/Search";

import Country from "@components/Country";
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
import uuid from "@lib/uuid";
import { mainLanguage } from "@lib/i18n";
import { getCountryName } from "@lib/i18n";
import { addAction } from "@lib/server";
import { pickOne } from "@lib/text";

const useStyles = makeStyles((theme) => ({
  list: {
    position: "relative",
    overflow: "auto",
    maxHeight: 300,
  },
}));

const Filter = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  let r = null;
  if (
    config.component.email?.filter?.includes("country") &&
    typeof config.component.country !== "string"
  ) {
    r = <Country form={props.form} list={config.component.email?.countries} />;
  }

  const handleSearch = async () => {
    const postcode = props.form.getValues("postcode");
    const api = "https://" + props.country + ".proca.app/" + postcode;
    if (props.constituency) return;
    const setValue = props.form.setValue;
    const fetchAPI = async (postcode) => {
      await fetch(api)
        .then((res) => {
          if (!res.ok) {
            setValue("locality", "");
            setValue("area", "");
            setValue("constituency", "");

            props.form.setError("postcode", {
              type: "network",
              message:
                res.status === 404
                  ? t("unknown postcode")
                  : res.statusText || "Network error",
            });
          }
          return res.json();
        })
        .then((res) => {
          console.warn("should be handled into the address");
        })
        .catch((err) => {
          props.form.setError("postcode", {
            type: "network",
            message: (err && err.toString()) || "Network error",
          });
        });
    };
    fetchAPI(postcode);

    console.log(postcode);
  };

  if (config.component.email?.filter?.includes("postcode")) {
    r = (
      <>
        <TextField
          form={props.form}
          autoComplete="postal-code"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Fetch postcode details"
                  onClick={handleSearch}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          label={t("Postal Code")}
          name="postcode"
        />
        <input type="hidden" {...props.form.register("area")} />
        <input type="hidden" {...props.form.register("constituency")} />
      </>
    );
  }
  if (
    config.component.email?.filter?.includes("multilingual") &&
    props.country
  ) {
    const ml = mainLanguage(props.country, false);
    if (Array.isArray(ml)) {
      r = (
        <TextField
          select
          name="language"
          label={t("Language")}
          form={props.form}
          onChange={(e) => {
            props.filterLocale(e.target.value);
            //  props.selecting(d, e.target.value);
          }}
          SelectProps={{
            native: true,
          }}
        >
          <option key="" value=""></option>

          {ml.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </TextField>
      );
    }
  }
  if (Array.isArray(config.component.email?.filter)) {
    config.component.email.filter.forEach((d) => {
      const data =
        config.component.email?.data && config.component.email?.data[d];
      if (!data) return null;

      r = (
        <TextField
          select
          name={d}
          label={/* i18next-extract-disable-line */ t(d)}
          form={props.form}
          onChange={(e) => {
            props.selecting(d, e.target.value);
          }}
          SelectProps={{
            native: true,
          }}
        >
          <option key="" value=""></option>

          {data.map((option) => (
            <option key={option.key} value={option.key}>
              {option.value}
            </option>
          ))}
        </TextField>
      );
    });
  }
  return r;
};

const Component = (props) => {
  const classes = useStyles();
  const config = useCampaignConfig();
  const setConfig = useSetCampaignConfig();
  const [profiles, setProfiles] = useState([]);

  const [data, setData] = useData();
  //  const [filter, setFilter] = useState({country:null});
  const [allProfiles, setAllProfiles] = useState([]);
  const [alwaysUpdate, setAlwaysUpdate] = useState(
    config.component.email?.multilingual === true
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

  const mttProcessing = config.component.email?.server?.processing;
  const fallbackRandom = config.component.email?.fallbackRandom;
  const fallbackArea = config.component.email?.fallbackArea;
  const countryFiltered = config.component.email?.filter?.includes("country");
  const postcodeFiltered = config.component.email?.filter?.includes("postcode");
  const localeFiltered =
    config.component.email?.filter?.includes("multilingual");
  const sampleSize = config.component.email?.sample || 1;
  const locale = config.locale;

  //this is not a "real" MTT, ie. we aren't sending individual emails to the targets but - for instance - weekly digests
  useEffect(() => {
    if (mttProcessing) setData("mttProcessing", false);
  }, [setData, mttProcessing]);

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

  const { watch, getValues, setValue, setError, clearErrors } = form;

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

  const checkUpdated = (e) => {
    // we do not automatically update the message as soon as the user starts changing it
    console.log("check updated");
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
          if (config.hook && typeof config.hook["target:load"] === "function") {
            d = config.hook["target:load"](d);
          }
          d.forEach((c) => {
            if (c.country) c.country = c.country.toLowerCase();
          });
          setAllProfiles(d);
          if (!config.component.email?.filter?.includes("country")) {
            setProfiles(d);
          }
          if (config.component.email?.filter?.includes("postcode")) {
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
    if (config.component.email?.listUrl) {
      const url =
        config.component.email.listUrl === true
          ? "https://widget.proca.app/t/" + config.campaign.name + ".json"
          : config.component.email.listUrl;
      fetchData(url);
    } else {
      const emails =
        typeof config.component.email?.to === "string"
          ? config.component.email.to?.split(",")
          : [];
      let to = [];
      emails.map((d) => {
        return to.push({ email: d.trim() });
      });
      //      console.log(to);
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
      return d;
    },
    [allProfiles]
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
    [sampleSize, fallbackRandom, allProfiles]
  );

  const filterProfiles = useCallback(
    (country, constituency, area) => {
      if (constituency || area) {
        country = country || "?";
      }
      if (!country) return;
      country = country.toLowerCase();
      let lang = undefined;
      let d = allProfiles.filter((d) => {
        if (constituency) {
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
          (d.country === "") | (d.constituency?.country === country)
        );
      });
      if (!lang) {
        // more than one lang in the country
        lang = mainLanguage(country, false);
        if (typeof lang === "object") {
          //TODO, fix quick hack
          lang = "fr_" + country;
        }
      }
      // display error if empty
      //    <p>{t("Select another country, there is no-one to contact in {{country}}",{country:country})}</p>
      if (d.length === 0 && fallbackArea) {
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

      if (d.length && countryFiltered) {
        setError("country", {
          message: t("target.country.empty", {
            country: getCountryName(country),
          }),
          type: "no_empty",
        });
      }
      if (d.length > 0) {
        clearErrors("country");
        clearErrors("postcode");
      }
      //if (lang && config.lang !== lang) {
      if (lang) {
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
      countryFiltered,
      postcodeFiltered,
      postcode,
    ]
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

    const profile = profiles[0] || { subject: null };

    let to = [];
    let cc = null;
    const bcc = config.component.email?.bcc;
    let s =
      typeof profile.subject == "function"
        ? profile.subject(profile)
        : paramEmail.subject;

    if (profile.actionUrl) {
      if (s.indexOf("{url}") !== -1) s = s.replace("{url}", profile.actionUrl);
      else s = s + " " + profile.actionUrl;
    }
    //const  paramEmail = {subject:t("campaign:email.subject",""),message:t("campaign:email.body","")};

    const body = paramEmail.message;
    for (var i = 0; i < profiles.length; i++) {
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
            subject: encodeURIComponent(s),
            cc: cc,
            bcc: bcc,
            body: encodeURIComponent(body),
          })
        : "mailto:" +
          to +
          "?subject=" +
          encodeURIComponent(s) +
          (cc ? "&cc=" + cc : "") +
          (bcc ? "&bcc=" + bcc : "") +
          "&body=" +
          encodeURIComponent(body);

    if (!to) {
      console.warn("no target, skip sending");
      return false;
    }
    var win = window.open(url, "_blank");
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
              required={config.component.email?.field?.subject?.required}
              label={t("Subject")}
              onChange={checkUpdated}
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

  const onClick = config.component.email?.server !== true ? send : null;

  const prepareData = (data) => {
    if (!data.message) data.message = getValues("message");
    if (data.comment) data.message += "\n" + data.comment;
    if (config.component.email?.salutation) {
      data.message = "{{target.fields.salutation}},\n" + data.message;
    }

    if (props.prepareData) data = props.prepareData(data);
    return data;
  };

  const filterTarget = (key, value) => {
    console.log("filterTarget");
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
    setProfiles(d);
  };

  return (
    <Container maxWidth="sm">
      {config.component.email?.progress && (
        <ProgressCounter actionPage={props.actionPage} />
      )}
      <Filter
        form={form}
        selecting={filterTarget}
        country={country}
        constituency={constituency}
        filterLocale={filterLocale}
      />
      {config.component.email?.showTo !== false && (
        <List className={classes.list} dense>
          {profiles.length === 0 &&
            !config.component.email?.filter?.includes("postcode") &&
            !constituency && <SkeletonListItem />}
          {profiles.map((d) => (
            <EmailAction
              key={d.id || JSON.stringify(d)}
              actionPage={config.actionPage}
              done={props.done}
              display={d.display}
              actionUrl={props.actionUrl || data.actionUrl}
              actionText={t(["campaign:share.twitter", "campaign:share"])}
              {...d}
            ></EmailAction>
          ))}
        </List>
      )}
      <Collapse in={profiles.length > 0}>
        <Register
          form={form}
          emailProvider={emailProvider}
          done={props.done}
          buttonText={t(config.component.register?.button || "action.email")}
          targets={config.component.email?.server ? profiles : null}
          beforeSubmit={prepareData}
          onClick={onClick}
          extraFields={ExtraFields}
        />
      </Collapse>
    </Container>
  );
};

export default Component;
