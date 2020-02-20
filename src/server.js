var query = `
mutation push($action: SignatureExtraInput,
  $contact:ContactInput,
  $privacy:ConsentInput) {
  addSignature(actionPageId: 1, 
    action: $action,
    contact:$contact,
    privacy:$privacy
  )}
`;

async function addSignature(data) {
  let variables = {"action": {
    "comment":data.comment
  },
    "contact":{
      "first_name": data.firstname,
      "last_name":data.lastname,
    	"email":data.email,
    	"address":{
        "country":data.country || "",
        "postcode": data.postcode || ""
      }
    },
    privacy: {optin: (data.privacy === "opt-in")}
  };
  let response=null;
  response= await fetch(process.env.REACT_APP_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // to prevent the prefetch OPTION, but doesn't work 'Content-Type': 'text/plain',
    'Accept': 'application/json',

  },
  body: JSON.stringify({
    query,
    variables: variables
  })
});
  return response;
}

export {addSignature};
