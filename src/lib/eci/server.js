import {graphQL} from '../server';


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
    optIn : data.privacy === "opt-in" || data.privacy === "opt-in-both",
    leadOptIn: data.privacy === "opt-in-both" || data.privacy === "opt-in-lead"
  };

//  const expected="uuid,firstname,lastname,email,country,postcode,locality,address,region,birthdate,privacy,tracking".split(",");
  let variables = {
    actionPage: actionPage,
    action: {
      actionType: actionType,
      fields: [] // added below
    },
    contact: {
      first_name: data.firstname,
      last_name: data.lastname,
      birthDate: data.birthDate,
      nationality: {
        country:data.nationality,
        documentNumber:data.documentNumber,
        documentType:data.documentType
      },
      address: {
        street_number: data.address ? "?":"",
        street: data.address || "",
        country: data.country || "",
        locality: data.city || "",
        postcode: data.postcode || ""
      }
    },
    privacy: privacy
  };
  if (data.uuid) 
    variables.contactRef = data.uuid;
  if (data.locality)
    variables.contact.address.locality = data.locality;

  if (Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }

// no custom values for ECI signatures
//  for (let [key,value] of Object.entries(data)) {
//    if (value && !(expected.includes(key)))
//      variables.action.fields.push({key:key,value:value})
//  }


  const response = await graphQL("addSupport", query, {
    variables: variables,
    extensions: {captcha: options.captcha || "dummy"},
    apiUrl: "https://eci.fixthestatusquo.org/api"
  });
      if (response.errors) {
        return response;
      }
  return response.addActionContact;
}

export { addSupport};
