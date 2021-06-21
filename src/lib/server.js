async function graphQL(operation, query, options) {
  if (!options) options = {};
  if (!options.apiUrl)
    options.apiUrl =
      process.env.REACT_APP_API_URL ||
      process.env.API_URL ||
      "https://api.proca.app/api";

  let data = null;
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (options.authorization) {
    //    var auth = 'Basic ' + Buffer.from(options.authorization.username + ':' + options.authorization.username.password).toString('base64');
    headers.Authorization = "Basic " + options.authorization;
  }
  await fetch(
    options.apiUrl +
      (options.variables.actionPage
        ? "?id=" + options.variables.actionPage
        : ""),
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query: query,
        variables: options.variables,
        operationName: operation || "",
        extensions: options.extensions,
      }),
    }
  )
    .then((res) => {
      if (!res.ok) {
        return {
          errors: [
            { message: res.statusText, code: "http_error", status: res.status },
          ],
        };
      }
      return res.json();
    })
    .then((response) => {
      if (response.errors) {
        const toCamel = (s) =>
          s.replace(/([_][a-z])/gi, ($1) => $1.toUpperCase().replace("_", ""));

        response.errors.fields = [];
        response.errors.forEach((error) => {
          const field = error.path && error.path.slice(-1)[0];
          if (!field) return;
          response.errors.fields.push({
            name: toCamel(field),
            message: error.message,
          });
        });
        data = response;
        return;
      }
      data = response.data;
    })
    .catch((error) => {
      console.log(error);
      data = { errors: [{ code: "network", message: error }] };
      return;
    });
  return data;
}

async function getLatest(actionPage, actionType, options) {
  var query = `query getLatest($actionPage:Int!,$actionType:String!) {
  actionPage(id:$actionPage) {
    campaign {
      actions(actionType:$actionType, limit: 10000) {
        list {
          actionId,
          fields {
            key, value
          }
        }
      }
    }
  }
}`;
  let variables = {
    actionPage: actionPage,
    actionType: actionType || "openletter",
  };
  const response = await graphQL("getLatest", query, {
    variables: variables,
  });
  if (response.errors) return response;
  const l = response.actionPage.campaign.actions.list || [];
  let result = [];
  l.forEach((d) => {
    const org = { id: d.actionId };
    d.fields.forEach((f) => {
      org[f.key] = f.value;
    });
    result.push(org);
  });
  return result.filter(
    (v, i, a) => a.findIndex((t) => t.twitter === v.twitter) === i
  );
}

async function getCount(actionPage, options) {
  let url = null;
  //actionCount {actionType, count}
  var query = `query getCount($actionPage: Int!)
{actionPage(id:$actionPage) {
  campaign {
    stats {
      supporterCount
    }
  }
}}
`;
  query = query.replace(/(\n)/gm, "").replace(/\s\s+/g, " ");
  if (options?.apiUrl) {
    url = options.apiUrl;
  } else {
    url =
      (process.env.REACT_APP_API_URL ||
        process.env.API_URL ||
        "https://api.proca.app/api") +
      "?query=" +
      encodeURIComponent(query) +
      "&variables=" +
      encodeURIComponent('{"actionPage":' + Number(actionPage) + "}");
  }
  var data = null;
  await fetch(url)
    .then((res) => {
      if (!res.ok) {
        return {
          errors: [
            { message: res.statusText, code: "http_error", status: res.status },
          ],
        };
      }
      return res.json();
    })
    .then((response) => {
      if (response.errors) {
        response.errors.forEach((error) => console.log(error.message));
        data = response;
        return;
      }
      data = response.data;
    })
    .catch((error) => {
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

async function getCountByName(name) {
  var query = `query getCountByName($name:String)
{actionPage(name:$name){id,campaign{name,title,
  externalId,stats{supporterCount }}}}
`;
  const response = await graphQL("getCountByName", query, {
    variables: { name: name },
  });
  if (!response || response.errors) return response;
  return {
    total: response.actionPage.campaign.stats.supporterCount,
    actionPage: response.actionPage.id,
  };
}

async function addAction(actionPage, actionType, data) {
  var query = `mutation addAction (
  $contact: ID!, 
  $actionPage: Int!,
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
    actionType: actionType,
    payload: data.payload,
    contact: data.uuid,
  };

  if (typeof data.payload === "object") {
    variables.payload = [];
    for (const [key, value] of Object.entries(data.payload)) {
      if (value) variables.payload.push({ key: key, value: value.toString() });
    }
  }

  if (data.tracking && Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }
  const response = await graphQL("addAction", query, {
    variables: variables,
  });
  return response;
}

async function addActionContact(actionType, actionPage, data) {
  var query = `mutation addActionContact(
  $action: ActionInput!,
  $contact:ContactInput!,
  $privacy:ConsentInput!,
  $contactRef:ID,
  $actionPage:Int!,
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
  const privacy = {
    optIn: data.privacy === "opt-in" || data.privacy === "opt-in-both",
    leadOptIn: data.privacy === "opt-in-both" || data.privacy === "opt-in-lead",
  };

  const expected = "uuid,firstname,lastname,email,phone,country,postcode,locality,address,region,birthdate,privacy,tracking".split(
    ","
  );
  let variables = {
    actionPage: actionPage,
    action: {
      actionType: actionType,
      fields: [], // added below
    },
    contact: {
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      phone: data.phone,
      address: {
        country: data.country || "",
        postcode: data.postcode || "",
      },
    },
    privacy: privacy,
  };
  if (data.uuid) variables.contactRef = data.uuid;
  if (data.region) variables.contact.address.region = data.region;
  if (data.locality) variables.contact.address.locality = data.locality;
  if (data.birthdate) variables.contact.birthDate = data.birthdate;

  if (data.tracking && Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }

  for (let [key, value] of Object.entries(data)) {
    if (value && !expected.includes(key))
      variables.action.fields.push({ key: key, value: value.toString() });
  }

  const response = await graphQL("addActionContact", query, {
    variables: variables,
  });
  if (response.errors) return response;
  return response.addActionContact;
}

const errorMessages = (errors) => {
  return errors.map(({ message }) => message).join(", ");
};

export {
  addActionContact,
  addAction,
  getCount,
  getCountByName,
  getLatest,
  graphQL,
  errorMessages,
};
