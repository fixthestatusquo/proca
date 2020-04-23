async function graphQL (operation, query, options) {
  if (!options) options = {};
  if (!options.apiUrl) options.apiUrl = process.env.REACT_APP_API_URL || process.env.API_URL;

  let data = null;
  let headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
  };
  if (options.authorization) {
//    var auth = 'Basic ' + Buffer.from(options.authorization.username + ':' + options.authorization.username.password).toString('base64');
    headers.Authorization = 'Basic '+options.authorization;
  }
  await fetch(process.env.REACT_APP_API_URL || process.env.API_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      query:query,
      variables: options.variables,
      operationName: operation || ""
    })
  })
  .then (res => {
    if (!res.ok) {
      return {errors:[{message:res.statusText,code: "http_error",status:res.status}]};
    }
    return res.json();
  }).then (response => {
    if (response.errors) {
      response.errors.forEach( (error) => console.log(error.message));
      data = response;
      return;
    }
    data = response.data;
  }).catch(error =>{
    console.log(error);
    data = error;
    return;
  });
  return data;
}

async function getCount(actionPage) {
  var query = 
`query getCount($actionPage: ID!)
{actionPage(id:$actionPage) {
  campaign {
    stats {
      signatureCount
    }
  }
}}
`;
  query = query.replace(/(\n)/gm, "").replace(/\s\s+/g, ' ');
  const url = (process.env.REACT_APP_API_URL || process.env.API_URL) + "?query="+ encodeURIComponent(query)+'&variables='+encodeURIComponent('{"actionPage":'+Number(actionPage)+'}');
  var data = null;
  await fetch(url)
  .then (res => {
    if (!res.ok) {
      return {errors:[{message:res.statusText,code: "http_error",status:res.status}]};
    }
    return res.json();
  }).then (response => {
    if (response.errors) {
      response.errors.forEach( (error) => console.log(error.message));
      data = response;
      return;
    }
    data = response.data;
  }).catch(error =>{
    console.log(error);
    data = error;
    return;
  });
// const data = await graphQL ("getCount",query,{variables:{ actionPage: Number(actionPage) }});
 if (!data || data.errors) return null;
console.log(data);
 return data.actionPage.campaign.stats.signatureCount;
}

async function addSignature(actionPage,data) {
  var query = `mutation addSignature($action: SignatureExtraInput,
  $contact:ContactInput,
  $privacy:ConsentInput,
  $actionPage:ID!,
  $tracking:TrackingInput
){
  addSignature(actionPageId: $actionPage, 
    action: $action,
    contact:$contact,
    privacy:$privacy,
    tracking:$tracking
  )}
`;

  let variables = {
    action: {
      comment: data.comment
    },
    contact: {
      first_name: data.firstname,
      last_name: data.lastname,
      email: data.email,
      address: {
        country: data.country || "",
        postcode: data.postcode || ""
      }
    },
    privacy: { optIn: data.privacy === "opt-in" }
  };
  if (Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }
  variables.actionPage = actionPage;
 const response = await graphQL ("addSignature",query,{variables:variables });
 return response;
}
export { addSignature,getCount };
