import { graphQL } from "../server";

async function addSupport(actionType, actionPage, data, options) {
  var query = `mutation addSupport(
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
    optIn:
      data.contentPrivacy === "opt-in" || data.contentPrivacy === "opt-in-both",
    leadOptIn:
      data.contentPrivacy === "opt-in-both" ||
      data.contentPrivacy === "opt-in-lead",
  };

  //  const expected="uuid,firstname,lastname,email,country,postcode,locality,address,region,birthdate,privacy,tracking".split(",");
  let variables = {
    actionPage: actionPage,
    action: {
      actionType: actionType,
      fields: [], // added below
    },
    contact: {
      first_name: data.firstname,
      last_name: data.lastname,
      nationality: {
        country: data.nationality,
        documentType: data.documentType,
      },
      address: {
        street_number: "",
        street: data.address || "",
        country: data.country || "",
        locality: data.city || "",
        postcode: data.postcode || "",
      },
    },
    privacy: privacy,
  };
  if (data.uuid) variables.contactRef = data.uuid;
  if (data.locality) variables.contact.address.locality = data.locality;
  if (data.birthDate) variables.contact.birthDate = data.birthDate;
  if (data.documentNumber)
    variables.contact.nationality.documentNumber = data.documentNumber;

  if (Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
    delete variables.tracking.location; // UNTIL FIXED
  }

  if (options.test) variables.action.testing = true;

  // no custom values for ECI signatures
  //  for (let [key,value] of Object.entries(data)) {
  //    if (value && !(expected.includes(key)))
  //      variables.action.fields.push({key:key,value:value})
  //  }

  if (options.captcha?.mac) {
    data.captcha += ":" + options.captcha.expiry + ":" + options.captcha.mac;
  }

  if (options.captcha.audio) {
    data.captcha += ":audio";
    variables.action.customFields = JSON.stringify({ captcha: "audio" });
  } else {
    data.captcha += ":image";
  }

  const response = await graphQL("addSupport", query, {
    variables: variables,
    extensions: {
      captcha: data.captcha || "dummy",
      captcha_service: "procaptcha",
    },
    apiUrl: options.apiUrl, // "https://eci.fixthestatusquo.org/api",
  });
  if (response.errors) {
    response.errors.forEach((d) => {
      if (d.extensions?.code === "bad_captcha") {
        if (!response.errors.fields) response.errors.fields = [];
        response.errors.fields.push({
          name: "captcha",
          message: d.message, // error.message,
        });
      }
    });
    return response;
  }
  return response.addActionContact;
}
const errorMessages = (errors) => {
  return errors.map(({ message }) => message).join(", ");
};

export { addSupport, errorMessages };
