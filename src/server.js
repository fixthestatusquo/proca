var query = `
mutation push($signature: SignatureInput) {
  addSignature(actionPageId: 1, signature: $signature)
}
`;

async function addSignature(data) {
  let variables = {"signature":{
    	"name": data.firstname + " " + data.lastname,
    	"email":data.email,
    	"address":{
        "country":data.country || "",
        "postcode": data.postcode || ""
      }
    }
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
