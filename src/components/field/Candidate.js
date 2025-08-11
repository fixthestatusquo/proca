import React, { useEffect, useState } from "react";
import { Grid, InputAdornment, IconButton, Button } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import RegisteredIcon from "@material-ui/icons/HowToReg";
import { get } from "@lib/urlparser";
import TextField from "@components/field/TextField";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import CancelIcon from "@material-ui/icons/Cancel";
import Country from "./Country";
import HiddenField from "@components/field/Hidden";
//import Autocomplete from "@material-ui/lab/Autocomplete";

const Affiliation = props => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const { setValue, watch, getValues, reset } = props.form;
  const [country, party] = watch(["country", "party"]);
  const [open, setOpen] = useState(false);

  const [parties, setParties] = useState([{ party: "Select your country" }]);
  const { classField } = props.classes;
  const externalId = get("uuid");
  const compare = new Intl.Collator(config.lang.substring(0, 2).toLowerCase())
    .compare;

  useEffect(() => {
    const fetchData = async url => {
      const res = await fetch(url);
      if (!res.ok) throw res.error();
      const d = await res.json();
      d.forEach(e => (e.country = e.country.toUpperCase()));
      d.sort((a, b) => compare(a.party, b.party));

      d.push({ party: "other" });
      setParties(d);
    };

    if (!country) {
      setParties([]);
      return;
    }
    fetchData(
      config.component.party?.url ||
        "https://static.proca.app/ep2024/parties.json"
    );
  }, [country]);

  useEffect(() => {
    const fetchData = async url => {
      const res = await fetch(url);
      if (!res.ok) throw res.error();
      const d = await res.json();
      const candidate = d.find(d => d.externalId === externalId);
      if (candidate) {
        const splitIndex = candidate.name.indexOf(" ");
        const firstname = candidate.name.substring(0, splitIndex);
        const lastname = candidate.name.substring(splitIndex + 1);

        setValue("firstname", firstname);
        setValue("lastname", lastname);
        setValue("country", candidate.country.toUpperCase());
        setValue("party", candidate.description);
        setValue("twitter", candidate.screen_name);
        setValue("picture", candidate.profile_image_url_https);
        setValue("twitter", candidate.screen_name);
      } else {
        console.log(d[5]);
      }
    };
    if (!externalId) return;
    fetchData(
      `https://widget.proca.app/t/${config.campaign.name.replace("candidates", "citizen")}.json`
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
            action={
              <Button
                onClick={() => {
                  reset();
                  setValue("picture", null); // !!for some reason reset does not affect picture
                  history.replaceState(null, "", window.location.pathname);
                }}
                color="inherit"
                size="small"
              >
                {t("supporter.not_you", "not you?")}
              </Button>
            }
          >
            {t("supporter.greeting", {
              defaultValue: "Welcome {{firstname}}!",
              firstname: getValues("firstname"),
            })}
          </Alert>
        </Grid>
      )}
      {config.component.country ? (
        <HiddenField
          form={props.form}
          name="country"
          value={config.component.country}
        />
      ) : (
        <Grid item xs={12}>
          <Country form={props.form} required />
        </Grid>
      )}
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
          <option key="empty" value="" />
          {parties
            .filter(d => d.country === country || !d.country)
            //            .sort((a, b) => a.party > b.party)
            .map(d => {
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
