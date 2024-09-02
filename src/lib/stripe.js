async function paymentIntent(params) {
  const url = `${process.env.REACT_APP_DONATION_URL}/stripe/oneoff`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let data = null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      return {
        errors: [
          { message: res.statusText, code: "http_error", status: res.status },
        ],
      };
    }

    const response = await res.json();
    if (response.errors) {
      response.errors.forEach((error) => console.log(error.message));
      return response;
    }
    return response;
  } catch (error) {
    console.log("error", error);
    data = { errors: [error], code: "http_error" };
    return data;
  }
}

export { paymentIntent };
