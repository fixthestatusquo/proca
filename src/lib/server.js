import {link, request, widget} from '@proca/api';

async function graphQL(query, variables, options) {
  if (!options) options = {};

  const host = options.apiUrl || process.env.REACT_APP_API_URL || process.env.API_URL;

  const api = link(host);

  const res = await request(api, query, variables);

  return res;
}


  // await fetch(process.env.REACT_APP_API_URL || process.env.API_URL, {
  //   method: "POST",
  //   headers: headers,
  //   body: JSON.stringify({
  //     query: query,
  //     variables: options.variables,
  //     operationName: operation || ""
  //   })
  // })
  //   .then(res => {
  //     if (!res.ok) {
  //       return {
  //         errors: [
  //           { message: res.statusText, code: "http_error", status: res.status }
  //         ]
  //       };
  //     }
  //     return res.json();
  //   })
  //   .then(response => {
  //     if (response.errors) {
  //       response.errors.forEach(error => console.log(error.message));
  //       data = response;
  //       return;
  //     }
  //     data = response.data;
  //   })
  //   .catch(error => {
  //     console.log(error);
  //     data = {errors:[{code:'network',message:error}]};
  //     return;
  //   });
  // return data;


async function getCount(actionPage, options) {
  const {data, errors} = await graphQL(widget.GetStatsDocument, {id: actionPage})
  if (errors) return {errors};
  return data.actionPage.campaign.stats.supporterCount;
}

async function getCountByUrl(url) {
  const name = url.replace("https://", '').replace("http://", ''); // replace legacy url with name
  const {data, errors} = await graphQL(widget.GetStatsDocument, {name})

  if (errors) return {errors};
  return {
    total: data.actionPage.campaign.stats.supporterCount,
    actionPage: data.actionPage.id
  };
}


async function addAction (actionPage, actionType, params) {
  let variables = {
    id: actionPage,
    actionType: actionType,
    fields: params.payload || [],
    contactRef: params.uuid
  };

  if (typeof params.fields === 'object') {
    variables.payload = [];
    for (const [key, value] of Object.entries(params.payload)) {
      if (value)
        variables.payload.push({key: key, value: value.toString() });
    }
  }

  if (params.tracking && Object.keys(params.tracking).length) {
    variables.tracking = params.tracking;
  }
  const {data, errors} = await graphQL(widget.AddActionDocument, variables)
  return data.addActionContact || {errors};
}

async function addActionContact(actionType, actionPage, params) {
  const contactFields = [
    'address',   'birthdate',
    'country',   'email',
    'firstname', 'lastname',
    'locality',  'postcode',
    'privacy',   'region',
    'tracking',  'uuid'
  ]

  let variables = {
    id: actionPage,
    actionType: actionType,
    fields: [], // added below
    contact: { 
      firstName: params.firstname,
      lastName: params.lastname,
      email: params.email,
      address: {
        country: params.country || "",
        postcode: params.postcode || ""
      }
    },
    privacy: { optIn: params.privacy === "opt-in", leadOptIn: params.privacy ==="opt-in" }
  };
  if (params.uuid) 
    variables.contactRef = params.uuid;
  if (params.region)
    variables.contact.address.region = params.region;
  if (params.locality)
    variables.contact.address.locality = params.locality;
  if (params.birthdate)
    variables.contact.birth_date = params.birthdate;

  if (Object.keys(params.tracking).length) {
    variables.tracking = params.tracking;
  }

  for (let [key,value] of Object.entries(params)) {
    if (value && !(contactFields.includes(key)))
      variables.action.fields.push({key, value})
  }

  const {data, errors} = await graphQL(widget.AddActionContactDocument, variables);
  return data.addActionContact || {errors};
}

export { addActionContact, addAction, getCount,getCountByUrl };
