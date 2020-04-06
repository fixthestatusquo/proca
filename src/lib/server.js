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
  let count=null;
  await fetch(process.env.REACT_APP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      query,
      variables: { actionPage: Number(actionPage) },
      operationName: "getCount"
    })
  })
  .then (res => {
    return res.json();
  }).then (response => {
    if (response.errors) {
      response.errors.forEach( (error) => console.log(error.message));
      count = null;
      return;
    }
    count = response.data.actionPage.campaign.stats.signatureCount;
  });
  return count;

}
async function addSignature(actionPage,data) {
  var query = `
mutation push($action: SignatureExtraInput,
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
  const response = await fetch(process.env.REACT_APP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // to prevent the prefetch OPTION, but doesn't work 'Content-Type': 'text/plain',
      Accept: "application/json"
    },
    body: JSON.stringify({
      query,
      variables: variables
    })
  });
  return response;
}
export { addSignature,getCount };
