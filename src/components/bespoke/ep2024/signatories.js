import React, { useEffect, useState, useCallback } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Avatar from "@material-ui/core/Avatar";
import Country from "@components/field/Country";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CountryFlag, { useCountryFlag, flag as emoji } from "react-emoji-flag";
//import CountryFlag, { useCountryFlag, flag as emoji } from "@hooks/flag";
//import { getCountryName } from "@lib/i18n";
import { imports } from "../../../actionPage";
import EUGroup from "./EUGroup";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexFlow: "column wrap",
    gap: "0 0px",
    height: 500, // set the height limit to your liking
    overflow: "auto",
  },
  item: {
    width: "auto",
  },
});

const ListSignatories = () => {
  const { t } = useTranslation();
  useCountryFlag({ className: "country-flag" });
  //const countries = new Set();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [electedOnly, setElected] = useState(false);
  const [parties, setParties] = useState(new Set());
  const config = useCampaignConfig();
  let Party = () => null;
  const classes = useStyles();
  const form = useForm({
    mode: "onBlur",
    //    nativeValidation: true,
  });

  const url =
    "https://static.proca.app/ep2024/" +
    // "http://localhost/ep2024/data/" +
    config.campaign.name.replace("_citizen_", "_candidates_") +
    ".json";

  const sort = config.component.signature?.sort || false;
  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.statusText;

      const d = await res.json();
      if (sort) {
        const e = d.sort((a, b) => {
          const electedA = a.field.elected;
          const electedB = b.field.elected;
          if (electedA && electedB) {
            return a.field.last_name.localeCompare(b.field.last_name);
          }
          if (electedA) {
            return -1;
          }
          if (electedB) {
            return 1;
            //            return a.field.last_name.localeCompare(b.field.last_name);
            //return mepB - mepA;
          }

          const positionA =
            a.field.position !== undefined ? a.field.position : Infinity;
          const positionB =
            b.field.position !== undefined ? b.field.position : Infinity;
          if (positionA !== positionB) {
            return positionA - positionB;
          }
          const mepA = a.field.mep !== undefined ? a.field.mep : false;
          const mepB = b.field.mep !== undefined ? b.field.mep : false;
          if (mepA && mepB) {
            return a.field.last_name.localeCompare(b.field.last_name);
          }
          if (mepA) {
            return -1;
          }
          if (mepB) {
            return 1;
            //            return a.field.last_name.localeCompare(b.field.last_name);
            //return mepB - mepA;
          }
          // Third criterion: name (alphabetical order)
          return a.field.last_name.localeCompare(b.field.last_name);
        });
        setData(e);
        return;
      }

      setData(d);
    };
    if (!url) return;
    fetchData(url);
  }, [url, setData, sort]);

  //r = <Country form={props.form} list={config.component.email?.countries} />;
  //  data.map((d) => countries.add(d.area));
  //var obj = Array.from(countries).reduce(function(o, val) { o[val] = false; return o; }, {});
  //console.log(obj);
  const country = config.component.country || form.watch("supporter_country");
  useEffect(() => {
    const _filtered = data.filter((d) => {
      if (country && d.area !== country) return false;
      if (electedOnly && !d.field.elected) return false;
      if (parties.size === 0) return true;
      return parties.has(d.field.party);
    });
    setFiltered(_filtered);
  }, [data, country, setFiltered, electedOnly, parties]);

  const empty = filtered.length === 0;
  useEffect(() => {
    const length = data.filter((d) => d.area === country).length;
    if (!country) {
      form.setError("supporter_country", {
        type: "ux",
        message: t("target.country.undefined"),
      });
      return;
    }
    if (length === 0) {
      //form.setError("supporter_country", { type: "ux", message: t("target.country.empty",{country:getCountryName(country)}) });
      form.setError("supporter_country", {
        type: "ux",
        message: t("target.country.empty", { country: emoji(country) }),
      });
    } else {
      form.clearErrors("supporter_country");
    }
  }, [empty, country]);

  const filterCountry = (d) => d.area === country;

  const filterSignature = useCallback(
    (key) => {
      if (typeof key === "function") {
        const d = key(data);
        if (typeof d === "object" && d.filter === "description") {
          setParties((prevParties) => {
            const updatedParties = new Set(prevParties);
            if (d.value) {
              updatedParties.add(d.key);
            } else {
              updatedParties.delete(d.key);
            }
            return updatedParties;
          });
        }
      }
    },
    [data],
  );
  //};

  if (imports.filter_Party) {
    Party = imports.filter_Party;
  }

  // todo
  /*
  filtered = data.filter((d) => {
console.log("filtered");
    if (!country) return true;

    if (parties.size !== 0) {
      return filterCountry(d) && parties.has(d.field.party);
    }
    return filterCountry(d);
  });
*/
  return (
    <div id="proca-signature">
      {config.component?.signature?.onlyElected &&
        !config.component.country && (
          <Country form={form} name="supporter_country" />
        )}
      {!config.component?.signature?.onlyElected && (
        <Grid container spacing={1}>
          <Grid item xs={12} sm={7}>
            {!config.component.country && (
              <Country form={form} name="supporter_country" />
            )}
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormControlLabel
              control={
                <Switch
                  checked={electedOnly}
                  onChange={(event) => setElected(event.target.checked)}
                  name="elected"
                />
              }
              label="only MEPs"
            />
          </Grid>
        </Grid>
      )}
      <Party
        selecting={filterSignature}
        country={country}
        getKey={(d) => d.field.party}
        filterCountry={filterCountry}
        profiles={data}
      />
      <List dense={true} disablePadding={true} className={classes.container}>
        {filtered.map((d) => (
          <ListItem
            key={`supporter-${d.externalId}`}
            className={classes.item}
            ContainerComponent="div"
          >
            <ListItemAvatar>
              <Avatar
                alt={d.name}
                src={
                  d.field.mep
                    ? d.field.mep &&
                      "https://www.europarl.europa.eu/mepphoto/" +
                        d.field.mep +
                        ".jpg"
                    : d.field.picture &&
                      d.field.picture?.replace(
                        "https://pbs.twimg.com/profile_images/",
                        "https://pic.proca.app/twimg/",
                      )
                }
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                d.field.eugroup ? (
                  <>
                    <EUGroup name={d.field.eugroup} />
                    {d.name}
                  </>
                ) : (
                  d.name
                )
              }
              secondary={d.field.party}
            />
            <ListItemSecondaryAction>
              <CountryFlag countryCode={d.area} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default ListSignatories;
