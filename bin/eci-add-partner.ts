import "cross-fetch/polyfill";
import {request, admin, types} from '@proca/api';
import {apiLink} from './config';
import {isEqual} from 'lodash';
require("dotenv").config();

const api = apiLink();

const checkError = (errors : any) => {
  if (errors) {
    throw new Error(JSON.stringify(errors));
  }
}

const pickName = (fromName, partner) => {
  const parts = fromName.split('/');
  parts.unshift(partner);
  return parts.join('/');
}

const copy = async (fn:string, org:string, tn:string) => {
  const {errors, data} = await request(api, admin.CopyActionPageDocument, {fromName: fn, toName: tn, toOrg:org});
  if (errors) {

    const [{path}] = errors; 

    if (isEqual(path,  ["copyActionPage","name"])) {
       // page exists, lets just fetch it
       const {errors, data} = await request(api, admin.GetActionPageDocument, {org: org, name: tn});
       checkError(errors);
       if (data?.org?.actionPage) {
        return {...data.org.actionPage, config: JSON.parse(data.org.actionPage.config)};
       } else {
        throw new Error(`didn't fetch page data for ${org} ${tn}}`);
       }
    } else {
      checkError(errors);
    }
  }
  if (data && data.copyActionPage) {
    //console.log("copied page config type", typeof data.copyActionPage.config);
    return {...data.copyActionPage, config: JSON.parse(data.copyActionPage.config)};
  } 
  throw new Error('no data returned');
};

const getOrg = async (org: string) => {
  const {errors, data} = await request(api, admin.DashOrgOverviewDocument, {org});
  checkError(errors);
  if (data && data.org) {
    return {...data.org, config: JSON.parse(data.org.config)};
  }
}

const updateConfig = async (apId :number, cfg:any) => {
  const cfgJSON = JSON.stringify(cfg);
  const {errors, data} = await request(api, admin.UpdateActionPageDocument, {id: apId, actionPage: {config: cfgJSON}});
  checkError(errors);
  if (data && data.updateActionPage?.id) {
    console.log('Updated the ap id ', data.updateActionPage?.id);
  } else {
    console.error('not updated?', data);
  }
  
}

const addPartner = async (genericPage:string, partnerOrg:string) => {
  const newAp = await copy(genericPage, partnerOrg, pickName(genericPage, partnerOrg) );
  const org : admin.DashOrgOverview['org'] = await getOrg(partnerOrg);

  // overwrite data in new AP
  let cfg = newAp.config;
  if (!cfg || !cfg.component || !cfg.component.consent  || !cfg.layout) {
    console.error('this config does not have component.consent or layout',cfg);
    throw new Error(`ad config for AP ${newAp.id}`);
  }
 //split consent
  cfg.component.consent.split = true;
  // priv policy
  if (org.config.privacy?.policyUrl)
    cfg.component.consent.privacyPolicy = org.config.privacy.policyUrl;

  // color
  if (org.config.brand?.primaryColor)
    cfg.layout.primaryColor = org.config.brand.primaryColor;
  // something else?


  await updateConfig(newAp.id, cfg);
};


// console.log('argv', process.argv);
const [_node, script, page, partner] : string[] = process.argv;

if (!page || !partner)  {
  console.error(`${script} page partner`);
} else  {
  addPartner(page, partner);
  
}
