const getDomain = (email) => {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  return parts[1];
};

// return name of the main domain of the MX record if found, false if no mx record
const checkMail = async (email) => {
  if (!email) return false;

  const domain = getDomain(email);
  if (!domain) return false;
  try {
    const response = await fetch(
      process.env.REACT_APP_CHECKMAIL_API_URL + "/" + domain,
    );
    const r = await response.json();
    return r;
  } catch (e) {
    console.log(e);
    return ""; // don't block submission if the service isn't reachable
  }
};

export default checkMail;
export { getDomain, checkMail };
