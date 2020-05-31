async function graphQL(operation, query, options) {
  if (!options) options = {};
  if (!options.apiUrl)
    options.apiUrl = process.env.REACT_APP_API_URL || process.env.API_URL;

  let data = null;
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (options.authorization) {
    //    var auth = 'Basic ' + Buffer.from(options.authorization.username + ':' + options.authorization.username.password).toString('base64');
    headers.Authorization = "Basic " + options.authorization;
  }
  await fetch(process.env.REACT_APP_API_URL || process.env.API_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: options.variables,
      operationName: operation || ""
    })
  })
    .then(res => {
      if (!res.ok) {
        return {
          errors: [
            { message: res.statusText, code: "http_error", status: res.status }
          ]
        };
      }
      return res.json();
    })
    .then(response => {
      if (response.errors) {
        response.errors.forEach(error => console.log(error.message));
        data = response;
        return;
      }
      data = response.data;
    })
    .catch(error => {
      console.log(error);
      data = error;
      return;
    });
  return data;
}

async function getCount(actionPage) {
  
      //actionCount {actionType, count}
  var query = `query getCount($actionPage: ID!)
{actionPage(id:$actionPage) {
  campaign {
    stats {
      supporterCount
    }
  }
}}
`;
  query = query.replace(/(\n)/gm, "").replace(/\s\s+/g, " ");
  const url =
    (process.env.REACT_APP_API_URL || process.env.API_URL) +
    "?query=" +
    encodeURIComponent(query) +
    "&variables=" +
    encodeURIComponent('{"actionPage":' + Number(actionPage) + "}");
  var data = null;
  await fetch(url)
    .then(res => {
      if (!res.ok) {
        return {
          errors: [
            { message: res.statusText, code: "http_error", status: res.status }
          ]
        };
      }
      return res.json();
    })
    .then(response => {
      if (response.errors) {
        response.errors.forEach(error => console.log(error.message));
        data = response;
        return;
      }
      data = response.data;
    })
    .catch(error => {
      console.log(error);
      data = { errors: [error], code: "http_error" };
      return;
    });
  // const data = await graphQL ("getCount",query,{variables:{ actionPage: Number(actionPage) }});
  if (!data || data.errors) return null;
/*  let count=0;
  actionType = actionType || "petition";
  data.actionPage.campaign.stats.actionCount.forEach(d => {
    if (d.actionType === actionType) count=d.count;
  });
  return count;
  */
  return data.actionPage.campaign.stats.supporterCount;
}

async function addAction (actionPage, actionType, data) {
  var query =`mutation addAction (
  $contact: ID!, 
  $actionPage: ID!,
  $actionType: String!,
  $payload: [CustomFieldInput!],
  $tracking: TrackingInput) 
{
  addAction (actionPageId: $actionPage, action: { actionType: $actionType, fields: $payload}
    contactRef: $contact, tracking: $tracking) 
  {contactRef}
}`;
  let variables = {
    actionPage: actionPage,
    actionType:actionType,
    payload:data.payload,
    contact: data.uuid
  };

  if (data.tracking && Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }
  const response = await graphQL("addAction", query, {
    variables: variables
  });
  return response;
}

async function addActionContact(actionType, actionPage, data) {
  var query = `mutation addActionContact(
  $action: ActionInput!,
  $contact:ContactInput!,
  $privacy:ConsentInput!,
  $contactRef:ID,
  $actionPage:ID!,
  $tracking:TrackingInput
){
  addActionContact(
    actionPageId: $actionPage, 
    action: $action,
    contactRef:$contactRef,
    contact:$contact,
    privacy:$privacy,
    tracking:$tracking
  ){contactRef,firstName}
  }
`;
  const expected="firstname,lastname,email,country,postcode,privacy,tracking".split(",");
  let variables = {
    actionPage: actionPage,
    action: {
      actionType: actionType,
      fields: [] // added below
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
    privacy: { optIn: data.privacy === "opt-in", leadOptIn: data.privacy ==="opt-in" }
  };
  if (Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }
  console.log(data);

  for (let [key,value] of Object.entries(data)) {
    if (value && !(expected.includes(key)))
      variables.action.fields.push({key:key,value:value})
  }

  const response = await graphQL("addActionContact", query, {
    variables: variables
  });
  return response;
}

export { addActionContact, addAction, getCount };
