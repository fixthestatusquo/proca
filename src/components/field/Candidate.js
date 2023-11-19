import React, { useEffect, useState } from "react";
import { Grid, InputAdornment, IconButton } from "@material-ui/core";
import { get } from "@lib/urlparser";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";
import CancelIcon from "@material-ui/icons/Cancel";
import Country from "./Country";
//import Autocomplete from "@material-ui/lab/Autocomplete";

const Affiliation = (props) => {
  const { t } = useTranslation();
  const { setValue, watch } = props.form;
  const [country, party] = watch(["country", "party"]);
  const [open, setOpen] = useState(false);

  const [parties, setParties] = useState([{ party: "Select your country" }]);
  const { classField } = props.classes;
  const dxid = get("dxid");

  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.error();
      const d = await res.json();
      d.forEach((e) => (e.country = e.country.toUpperCase()));
      d.push({ party: "other" });
      setParties(d);
    };

    if (!country) {
      setParties([]);
      return;
    }
    fetchData("https://www.tttp.eu/data/parties.json");
  }, [country]);

  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.error();
      const d = await res.json();
      const mep = d.find((d) => d.dxid === dxid);
      if (mep) {
        setValue("firstname", mep.first_name);
        setValue("lastname", mep.last_name);
        setValue("country", mep.constituency.country.toUpperCase());
        setValue("party", mep.constituency.party);
        setValue("twitter", mep.Twitter);
        setValue("email", mep.mail);
        setValue(
          "picture",
          "https://www.europarl.europa.eu/mepphoto/" + mep.epid + ".jpg",
        );
        //{       setValue("picture",mep.meta.
      } else {
        console.log(d[5]);
      }
    };
    if (!dxid) return;
    fetchData("https://www.tttp.eu/data/meps.json");
  }, [dxid]);

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
          label={t("Party")}
          form={props.form}
          SelectProps={{
            native: true,
          }}
        >
          <option key="empty" value=""></option>
          {parties
            .filter((d) => d.country === country || !d.country)
            .sort((a, b) => a.party > b.party)
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
