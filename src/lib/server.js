async function graphQL(operation, query, options) {
  if (!options) options = {};
  if (!options.apiUrl)
    options.apiUrl =
      process.env.REACT_APP_API_URL || "https://api.proca.app/api";

  let data = null;
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (options.authorization) {
    //    var auth = 'Basic ' + Buffer.from(options.authorization.username + ':' + options.authorization.username.password).toString('base64');
    headers.Authorization = "Basic " + options.authorization;
  }
  // console.debug("graphql: ", query, options.variables);
  await fetch(
    options.apiUrl +
      (options.variables.actionPage
        ? "?id=" + options.variables.actionPage
        : ""),
    {
      method: "POST",
      referrerPolicy: "no-referrer-when-downgrade",
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
          let msg = error.message.split(":");
          if (msg.length === 2) {
            msg = msg[1];
          } else {
            msg = error.message;
          }
          response.errors.fields.push({
            name: toCamel(field),
            message: msg, // error.message,
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
    url =
      options.apiUrl +
      "?query=" +
      encodeURIComponent(query) +
      "&variables=" +
      encodeURIComponent('{"actionPage":' + Number(actionPage) + "}");
  } else {
    url =
      (process.env.REACT_APP_API_URL || "https://api.proca.app/api") +
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

async function addAction(actionPage, actionType, data, test) {
  var query = `mutation addAction (
  $contact: ID!,
  $actionPage: Int!,
  $actionType: String!,
  $payload: Json,
  $tracking: TrackingInput)
{
  addAction (actionPageId: $actionPage, action: { actionType: $actionType, customFields: $payload}
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
    variables.payload = JSON.stringify(variables.payload);
  }
  if (data.tracking && Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }
  const response = await graphQL("addAction", query, {
    variables: variables,
  });
  return response;
}

const PROCA_FREQUENCIES = {
  daily: "DAY",
  day: "DAILY",
  month: "MONTHLY",
  monthly: "MONTHLY",
  oneoff: "ONE_OFF",
  week: "WEEKLY",
  weekly: "WEEKLY",
  year: "YEARLY",
  yearly: "YEARLY",
};
async function addDonateContact(provider, actionPage, data, test) {
  delete data.IBAN;
  if (!data.donation.payload) data.donation.payload = {};
  data.donation.payload.provider = provider;
  data.donation.payload = JSON.stringify(data.donation.payload);
  if (!Number.isInteger(data.donation.amount)) {
    throw Error(
      `Donation amount should be an integer, expressing the amount in cents. You sent '${data.donation.amount}'.`
    );
  }
  if (data.donation.frequencyUnit) {
    data.donation.frequencyUnit =
      PROCA_FREQUENCIES[data.donation.frequencyUnit] ||
      data.donation.frequencyUnit;
  }
  console.debug("Donation Data for Proca", data.donation);

  return await addActionContact("donate", actionPage, data, test);
}

async function addActionContact(actionType, actionPage, data, test) {
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
  let privacy = {
    optIn: data.privacy === "opt-in" || data.privacy === "opt-in-both",
    leadOptIn: data.privacy === "opt-in-both" || data.privacy === "opt-in-lead",
  };

  if (!data.privacy)
    // case where the consent wasn't given because not asked
    privacy = {};

  let expected =
    //"uuid,firstname,lastname,email,phone,country,postcode,street,locality,address,region,birthdate,privacy,tracking,donation".split(
    "uuid,firstname,lastname,email,phone,country,postcode,street,address,region,birthdate,privacy,tracking,donation".split(
      ","
    );
  let variables = {
    actionPage: actionPage,
    action: {
      actionType: actionType,
      customFields: {}, // added below
    },
    contact: {
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      phone: data.phone,
      address: {
        country: data.country || "",
        postcode: data.postcode || "",
        street: data.street || "",
      },
    },
    privacy: privacy,
  };

  if (test) variables.action.testing = true;
  console.log(data);
  if (data.targets) {
    if (data.mttProcessing !== false) {
      variables.action.mtt = {
        subject: data.subject,
        body: data.message,
        targets: data.targets.map((d) => d.procaid),
      };
      delete data.message;
      delete data.subject;
    }
    delete data.targets;
  }
  if (data.donation) variables.action.donation = data.donation;
  if (data.uuid) variables.contactRef = data.uuid;
  if (data.region) variables.contact.address.region = data.region;
  //if (data.locality) variables.contact.address.locality = data.locality;
  if (data.birthdate) variables.contact.birthDate = data.birthdate;

  if (data.tracking && Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }

  for (let [key, value] of Object.entries(data)) {
    if (value && !expected.includes(key))
      variables.action.customFields[key] = value;
  }
  variables.action.customFields = JSON.stringify(variables.action.customFields);
  const response = await graphQL("addActionContact", query, {
    variables: variables,
  });
  if (response.errors) return response;
  return response.addActionContact;
}

async function stripeCreateCustomer(actionPageId, contactDetails) {
  var query = `mutation addStripeObject (
    $actionPageId: Int!,
    $customer: Json,
  ) {
    addStripeObject (
      actionPageId: $actionPageId,
      customer: $customer,
    )
  }
  `;

  const response = await graphQL("addStripeObject", query, {
    variables: {
      actionPageId: actionPageId,
      customer: JSON.stringify(contactDetails),
    },
  });
  if (response.errors) return response;

  const customer = JSON.parse(response.addStripeObject);
  // console.log("customer create stripe response", customer);

  return customer;
}

async function stripeCreate(params /* pageId, amount, currency, contact,*/) {
  const customer = await stripeCreateCustomer(
    params.actionPage,
    params.contact
  );

  const amount = params.amount;
  const currency = params.currency;
  const actionPage = params.actionPage;

  const isSubscription = params.frequency && params.frequency !== "oneoff";
  if (isSubscription) {
    const frequency = params.frequency;

    return await stripeCreateSubscription(
      {
        actionPage,
        customer,
        frequency,
        amount,
        currency,
      },
      params
    );
  }

  return await stripeCreatePaymentIntent(
    { actionPage, customer, amount, currency },
    params
  );
}

async function stripeCreatePaymentIntent({
  actionPage,
  customer,
  amount,
  currency,
}) {
  var query = `mutation addStripeObject (
    $actionPageId: Int!,
    $customer: Json,
    $price: Json,
    $subscription: Json,
    $paymentIntent: Json
  ) {
    addStripeObject (
      actionPageId: $actionPageId,
      customer: $customer,
      price: $price,
      subscription: $subscription,
      paymentIntent: $paymentIntent
    )
  }
  `;

  const variables = {
    actionPageId: actionPage,
    paymentIntent: JSON.stringify({
      amount: amount,
      currency: currency,
      setup_future_usage: "off_session",
      customer: customer.id,
    }),
  };
  // console.debug("GraphQL query ", query, variables);
  const response = await graphQL("addStripeObject", query, {
    variables: variables,
  });
  // console.debug("Proca Response ", response);
  if (response.errors) return response;

  const stripeResponse = JSON.parse(response.addStripeObject);
  // console.debug("Stripe response ", stripeResponse);

  return {
    response: stripeResponse,
    client_secret: stripeResponse.client_secret,
  };
}

async function stripeCreateSubscription(
  { actionPage, customer, amount, currency, frequency },
  params
) {
  var query = `mutation addStripeObject (
    $actionPageId: Int!,
    $customer: Json,
    $price: Json,
    $subscription: Json,
    $paymentIntent: Json
  ) {
    addStripeObject (
      actionPageId: $actionPageId,
      customer: $customer,
      price: $price,
      subscription: $subscription,
      paymentIntent: $paymentIntent
    )
  }
  `;

  // const STRIPE_RECURRING_INTERVALS = {
  //   weekly: 'week',
  //   monthly: 'month',
  //   daily: 'day',
  //   yearly: 'year',
  // };

  // items[0][price_data][recurring][interval].",
  const subscription = {
    payment_behavior: "default_incomplete",
    metadata: params.metadata || {},
    customer: customer.id,
    items: [
      {
        price_data: {
          unit_amount: amount,
          currency: currency,
          product: params.stripe_product_id,
          recurring: { interval: frequency, interval_count: 1 },
        },
      },
    ],
    expand: ["latest_invoice.payment_intent"],
  };

  const response = await graphQL("addStripeObject", query, {
    variables: {
      actionPageId: actionPage,
      subscription: JSON.stringify(subscription),
    },
  });
  if (response.errors) return response;

  const stripeResponse = JSON.parse(response.addStripeObject);
  // console.debug(" Create Subscription Response:", stripeResponse);
  return {
    subscriptionId: stripeResponse.id,
    client_secret: stripeResponse.latest_invoice.payment_intent.client_secret,
    response: stripeResponse,
  };
}

const errorMessages = (errors) => {
  return errors.map(({ message }) => message).join(", ");
};

export {
  addActionContact,
  addDonateContact,
  addAction,
  getCount,
  getCountByName,
  getLatest,
  graphQL,
  stripeCreatePaymentIntent,
  stripeCreate,
  errorMessages,
};
