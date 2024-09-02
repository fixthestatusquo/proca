import { graphQL } from "../../../lib/server";

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
    optIn: data.privacy === "opt-in" || data.privacy === "opt-in-both",
    leadOptIn: data.privacy === "opt-in-both" || data.privacy === "opt-in-lead",
  };

  const variables = {
    actionPage: actionPage,
    action: {
      actionType: actionType,
      fields: [
        { key: "birthPlace", value: data.birthplace },
        { key: "authority", value: data.authority },
      ],
    },
    contact: {
      firstName: data.firstname,
      lastName: data.lastname,
      birthDate: data.birthDate,
      nationality: {
        country: "IT",
        documentNumber: data.documentNumber,
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
  if (data.email) variables.contact.email = data.email;

  if (Object.keys(data.tracking).length) {
    variables.tracking = data.tracking;
  }

  const response = await graphQL("addSupport", query, {
    variables: variables,
    extensions: { captcha: options.captcha },
    apiUrl: options.apiUrl, // "https://eci.fixthestatusquo.org/api",
  });
  if (response.errors) {
    return response;
  }
  return response.addActionContact;
}
const errorMessages = (errors) => {
  return errors.map(({ message }) => message).join(", ");
};

export { addSupport, errorMessages };
