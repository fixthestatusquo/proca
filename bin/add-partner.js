// usage add-partner name/page partner. will create the partner if missing
require("cross-fetch/polyfill");
require("dotenv").config();

const { request, admin, widget } = require("@proca/api");
const { pull, apiLink } = require("./config");
const isEqual = require("lodash").isEqual;
const api = apiLink();

const checkError = (errors) => {
  if (errors) {
    throw new Error(JSON.stringify(errors));
  }
};

const pickName = (fromName, partner) => {
  fromName = fromName.replace(/[.]/g, "");
  const parts = fromName.split("/");
  parts.unshift(partner);
  return parts.join("/").toLowerCase();
};

const copy = async (fn, org, tn) => {
  const { errors, data } = await request(api, admin.CopyActionPageDocument, {
    fromName: fn,
    toName: tn,
    toOrg: org,
  });
  if (errors) {
    const [{ path }] = errors;

    if (isEqual(path, ["copyActionPage", "name"])) {
      // page exists, lets just fetch it
      console.log(`page ${tn} exists, I'll fetch and updated it instead.`);

      let { errors, data } = await request(api, widget.GetActionPageDocument, {
        name: fn,
      });
      checkError(errors);
      const fromConfig = data.actionPage.config;
      console.log({ org: org, name: fn });
      const existing = await request(api, admin.GetActionPageDocument, {
        org: org,
        name: tn,
      });
      if (
        existing.errors &&
        existing.errors[0].extensions.code == "not_found"
      ) {
        console.log("actionpage doesn't exist", fn);
      }

      checkError(existing.errors);
      if (existing.data && existing.data.org && existing.data.org.actionPage) {
        return {
          ...existing.data.org.actionPage,
          config: JSON.parse(fromConfig),
        };
      } else {
        throw new Error(`didn't fetch page data for ${org} ${tn}}`);
      }
    } else {
      checkError(errors);
    }
  }
  if (data && data.copyActionPage) {
    // console.log("copied page config type", typeof data.copyActionPage.config);
    return {
      ...data.copyActionPage,
      config: JSON.parse(data.copyActionPage.config),
    };
  }
  throw new Error("no data returned");
};

const getOrg = async (org) => {
  const { errors, data } = await request(api, admin.DashOrgOverviewDocument, {
    org,
  });
  if (data && data.org) {
    return { ...data.org, config: JSON.parse(data.org.config) };
  }
  console.log(errors, data);
  throw new Error(errors);
};

const updateConfig = async (apId, cfg) => {
  const cfgJSON = JSON.stringify(cfg);
  const { errors, data } = await request(api, admin.UpdateActionPageDocument, {
    id: apId,
    actionPage: { config: cfgJSON },
  });
  checkError(errors);
  if (data && data.updateActionPage && data.updateActionPage.id) {
    console.log("Updated the ap id ", data.updateActionPage.id);
  } else {
    console.error("not updated?", data);
  }
};

const addOrg = async (partnerOrg) => {
  const { errors, data } = await request(api, admin.AddOrgDocument, {
    org: { name: partnerOrg, title: partnerOrg },
  });
  if (errors && errors[0].path.splice(-1)[0] != "name") {
    // ignore error if org already exists
    checkError(errors);
  }
  console.log("created new org", partnerOrg, data.addOrg.id);
  return {
    id: data.addOrg.id,
    config: { component: {} },
    name: partnerOrg,
    title: partnerOrg,
  };
};

const addPartner = async (genericPage, partnerOrg) => {
  const joinResult = await request(api, admin.JoinOrgDocument, {
    orgName: partnerOrg,
  });
  if (joinResult.errors)
    console.error(
      `Could not join ${partnerOrg} as superuser`,
      joinResult.errors
    );

  let org = null;
  try {
    org = await getOrg(partnerOrg);
  } catch (e) {
    console.log(e);
    console.log("creating org", partnerOrg);
    org = await addOrg(partnerOrg);
  }
  console.log(org);

  const newAp = await copy(
    genericPage,
    partnerOrg,
    pickName(genericPage, partnerOrg)
  );
  console.log("copy:", newAp);

  // overwrite data in new AP
  let cfg = newAp.config;
  if (cfg.component && "consent" in cfg.component) {
    cfg.component.consent = {};
  }

  if (!cfg || !cfg.component || !cfg.component.consent || !cfg.layout) {
    console.error("this config does not have component.consent or layout", cfg);
    throw new Error(`ad config for AP ${newAp.id}`);
  }
  // split consent
  cfg.component.consent.split = false;
  // priv policy
  cfg.component.consent.privacyPolicy =
    (org.config.privacy && org.config.privacy.policyUrl) ||
    cfg.component.consent.privacyPolicy ||
    "";

  // color
  if (org.config.brand && org.config.brand.primaryColor) {
    cfg.layout.primaryColor = org.config.brand.primaryColor;
  }
  // something else?

  await updateConfig(newAp.id, cfg);
  try {
    console.log("fetching config/", newAp.id);
    await pull(parseInt(newAp.id, 10));
  } catch (e) {
    console.error(e);
  }
};

// console.log('argv', process.argv);
const [_node, script, page, partner] = process.argv;

if (!page || !partner) {
  console.error(`${script} page partner`);
} else {
  addPartner(page, partner).catch((e) => console.error(e));
}
