const fs=require('fs');
const path=require('path');
import {link, admin, widget, request} from '@proca/api'

const tmp = '../tmp.config/';


const file = (id) => {
  return path.resolve(__dirname, tmp + id + ".json");
}

const read = (id) =>{
  try {
    return JSON.parse(fs.readFileSync(file(id), 'utf8'));
  } catch (e) {
    console.error("no local copy of the actionpage "+id,e.message);
    return null;
  }
}

const backup = (actionPage) => {
  const fileName = file(actionPage);
  fs.renameSync (fileName,fileName + ".bck");
}

const save = (config) => {
  const id = config.actionpage; 
  fs.writeFileSync(file(id),JSON.stringify(config,null,2));
}

const fetch = async (actionPage) =>  {
  const c = link(process.env.REACT_APP_API_URL || 'https://api.proca.app/api');
  
  const query = widget.GetActionPageDocument
  let vars = {};

  const {data, errors} = await request(c, widget.GetActionPageDocument, {id:actionPage})
  if (errors) throw errors

  if (data.actionPage.journey.length === 0){
    data.actionPage.journey = ["Petition","Share"];
  }

  const config = { actionpage: data.actionPage.id,
    organisation: data.actionPage.campaign.org.title,
    lang: data.actionPage.locale.toLowerCase(),
    filename: data.actionPage.name,
    org: data.actionPage.campaign.org,
    campaign: {title:data.actionPage.campaign.title},
    journey: data.actionPage.journey,
    layout:data.actionPage.config.layout || {},
    component:data.actionPage.config.component || {},
    locale:data.actionPage.config.locale || {}
  }
  return config;
//  const ap = argv.public ? data.actionPage : data.org.actionPage

//  let t = null
//  t = fmt.actionPage(ap, data.org)
//  console.log(t)
};

const pull = async (actionPage) => {
//  console.log("file",file(actionPage));
  const local = read (actionPage);
  const config = await fetch(actionPage);
  if (local && JSON.stringify(local) !== JSON.stringify(config)) {
    backup(actionPage);
  }
  save(config);
};

export {pull, fetch, read, file};

