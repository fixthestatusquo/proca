import { useCampaignConfig, useSetCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import useInteraction from "@hooks/useInteraction";
import { Chip, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SettingsIcon from "@material-ui/icons/Settings";
import StatsIcon from "@material-ui/icons/ShowChart";
//import Alert from "@components/Alert";
import { Alert } from "@material-ui/lab";
import { parse } from "dxid";
import { useEffect, useState } from "react";

const useGlobalStyles = makeStyles({
  "@global": {
    ".proca-widget h3": {
      fontSize: "1.6rem",
      letterSpacing: "-0.01em",
      fontWeight: 700,
      lineHeight: "1.125",
      marginBottom: "1.5rem",
    },
    ".proca-MuiButton-label": {
      fontWeight: "600",
      letterSpacing: "-0.01em",
    },
    ".proca-MuiButton-containedSizeSmall": {
      padding: "2px 10px",
      fontSize: "0.65rem",
      color: "#fff",
      boxShadow: "none",
    },
    ".proca-MuiFilledInput-root": {
      backgroundColor: "#f5f5f5",
      "&:hover": {
        backgroundColor: "#fcfcfc",
      },
      "&.Mui-focused": {
        backgroundColor: "#fcfcfc",
      },
    },
    "#proca_submit": {
      borderRadius: "32px",
      fontSize: "24px",
      color: "white",
      textTransform: "none",
    },
  },
});

// the phone code is only sent as the werbecode, and only when a phone is given
const prepareCustomFields = formData => {
  // data-promocodephone -> promocodephone; the other spellings are historical
  const PHONE_CODE = ["promocodephone", "promocodePhone", "promocode_phone"];
  const phoneCode = v => PHONE_CODE.map(key => v[key]).find(Boolean);
  const code = phoneCode(formData);
  for (const key of PHONE_CODE) delete formData[key];
  if (formData.phone && code) formData.promocode = code;
  return formData;
};

const src = props => {
  const config = useCampaignConfig();
  const setConfig = useSetCampaignConfig();
  const [data] = useData();
  useInteraction(props.form); //sends events when the user starts filling the form
  useGlobalStyles();
  const [open, setOpen] = useState(true);
  const urlParams = new URLSearchParams(window.location.search);
  const handleBeforeSubmit = props.handleBeforeSubmit;
  useEffect(() => {
    // only when mounted via component.register.custom.* (Register passes the hook)
    if (!handleBeforeSubmit) return;
    handleBeforeSubmit(prepareCustomFields);
  }, [handleBeforeSubmit]);
  useEffect(() => {
    // test mode for drupal editors; setConfig, a plain mutation doesn't re-render
    // and the debug block below would stay hidden
    if (!window.drupalSettings?.user?.uid || config.test) return;
    setConfig(current => ({ ...current, test: true }));
  }, [config.test, setConfig]);

  // codes are dxid encoded, but accept plain text too
  const decode = v => {
    try {
      return parse(v);
    } catch {
      return v;
    }
  };
  // data-promocode / data-promocodephone, from the script tag (widget args)
  // or from the .proca-widget div (form data)
  let params = {
    promocode: data.promocode || config.data?.promocode,
    promocode_phone: phoneCode(data) || phoneCode(config.data || {}),
    bannerid: data.bannerid || config.data?.bannerid,
  };
  const _src = urlParams.get("src");
  if (_src) {
    const src = _src.split("-").map(decode);
    if (src.length !== 3) {
      console.error("not the right src length", src);
    } else {
      // ?src= promocode-promocodephone-bannerid wins over the data-* attributes
      params = { promocode: src[0], promocode_phone: src[1], bannerid: src[2] };
    }
  }
  const { promocode, promocode_phone, bannerid } = params;

  const sync = config.component?.sync;
  // the widget remounts the step on every config change, so only apply once
  const applied =
    sync?.promoCode?.default === promocode &&
    (!promocode_phone || sync?.promoCode?.phone === promocode_phone) &&
    (!bannerid || sync?.bannerId === bannerid);

  useEffect(() => {
    if (!promocode || applied) return;
    setConfig(current => {
      const sync = current.component?.sync;
      return {
        ...current,
        component: {
          ...current.component,
          sync: {
            ...sync,
            promoCode: {
              ...sync?.promoCode,
              default: promocode,
              ...(promocode_phone ? { phone: promocode_phone } : {}),
            },
            ...(bannerid ? { bannerId: bannerid } : {}),
          },
        },
      };
    });
  }, [promocode, promocode_phone, bannerid, applied, setConfig]);

  useEffect(() => {
    if (!bannerid) return;
    document.querySelectorAll("a[href]").forEach(link => {
      // TODO: only update the donation link
      try {
        const url = new URL(link.href, window.location.origin);
        url.searchParams.set("BannerID", bannerid);
        link.href = url.toString();
      } catch (_e) {
        console.warn("Malformed URL:", link.href);
      }
    });
  }, [bannerid]);

  if (config.test && open)
    return (
      <Grid item xs={12}>
        <Alert
          icon={<SettingsIcon fontSize="inherit" />}
          severity="info"
          onClose={() => setOpen(false)}
        >
          <Chip
            label="Stats"
            component="a"
            icon={<StatsIcon />}
            href={`https://we.fixthestatusquo.org/widget/${config.actionPage}/stats`}
            target="_blank"
            variant="outlined"
            color="primary"
            clickable
          />
          <ul>
            {Object.entries(params)
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => (
                <li key={key}>
                  <b>{key}</b> = {value}
                </li>
              ))}
          </ul>
        </Alert>
      </Grid>
    );
  return null;
};

export { prepareCustomFields };
export default src;
