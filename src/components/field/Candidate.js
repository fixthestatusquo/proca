import React, { useEffect, useState } from "react";
import { Grid, InputAdornment, IconButton } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import RegisteredIcon from "@material-ui/icons/HowToReg";
import { get } from "@lib/urlparser";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import CancelIcon from "@material-ui/icons/Cancel";
import Country from "./Country";
//import Autocomplete from "@material-ui/lab/Autocomplete";

const Affiliation = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const { setValue, watch, getValues } = props.form;
  const [country, party] = watch(["country", "party"]);
  const [open, setOpen] = useState(false);

  const [parties, setParties] = useState([{ party: "Select your country" }]);
  const { classField } = props.classes;
  const externalId = get("uuid");
  const compare = new Intl.Collator(config.lang.substring(0, 2).toLowerCase())
    .compare;

  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.error();
      const d = await res.json();
      d.forEach((e) => (e.country = e.country.toUpperCase()));
      d.sort((a, b) => compare(a.party, b.party));

      d.push({ party: "other" });
      setParties(d);
    };

    if (!country) {
      setParties([]);
      return;
    }
    fetchData("https://static.proca.app/ep2024/parties.json");
  }, [country]);

  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.error();
      const d = await res.json();
      const candidate = d.find((d) => d.externalId === externalId);
      if (candidate) {
        setValue("firstname", candidate.name);
        setValue("lastname", candidate.name);
        setValue("country", candidate.country.toUpperCase());
        setValue("party", candidate.description);
        setValue("twitter", candidate.screen_name);
        //
        setValue("picture", candidate.profile_image_url_https);
        setValue("twitter", candidate.screen_name);
      } else {
        console.log(d[5]);
      }
    };
    if (!externalId) return;
    fetchData(
      `https://widget.proca.app/t/${config.campaign.name.replace("candidates", "citizen")}.json`,
    );
  }, [externalId]);

  useEffect(() => {
    if (party === "") return;
    if (party === "other") {
      setOpen(true);
    } else setOpen(false);
  }, [party]);

  const width = () => {
    return 12;
  };

  const handleClick = () => {
    setOpen(false);
    setValue("party", "");
  };

  return (
    <>
      {externalId && (
        <Grid item xs={12}>
          <Alert
            severity="info"
            className="supporter"
            icon={<RegisteredIcon fontSize="inherit" />}
          >
            {t("supporter.welcome", {
              defaultValue: "Welcome back {{firstname}}!",
              firstname: getValues("firstname"),
            })}
          </Alert>
        </Grid>
      )}
      <Grid item xs={12}>
        <Country form={props.form} required />
      </Grid>
      <Grid item xs={width()} sm={width()} className={classField}>
        <TextField
          hidden={open}
          select={!open}
          type={open ? "hidden" : undefined}
          name="party"
          required
          label={t("party")} // because server decapitalizes key words
          form={props.form}
          SelectProps={{
            native: true,
          }}
        >
          <option key="empty" value=""></option>
          {parties
            .filter((d) => d.country === country || !d.country)
            //            .sort((a, b) => a.party > b.party)
            .map((d) => {
              return (
                <option key={d.party + d.eugroup + d.country} value={d.party}>
                  {d.party}
                </option>
              );
            })}
        </TextField>
        {open && ( // open
          <>
            <TextField
              name="affiliation-other"
              label={parties["other"]}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Cancel"
                      onClick={handleClick}
                      edge="end"
                    >
                      <CancelIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoFocus
              form={props.form}
            />
          </>
        )}
      </Grid>
    </>
  );
};

export default Affiliation;
