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
      console.log(response.errors.message);
      count = null;
    }
    console.log(response.data.actionPage.campaign.stats.signatureCount);
    count = response.data.actionPage.campaign.stats.signatureCount;
  });
  return count;

}
async function addSignature(data) {
  var query = `
mutation push($action: SignatureExtraInput,
  $contact:ContactInput,
  $privacy:ConsentInput,
  $tracking:TrackingInput
){
  addSignature(actionPageId: 1, 
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
