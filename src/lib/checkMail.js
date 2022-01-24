const checkMail = async (email) => {
  if (!email) return false;

  const parts = email.split("@");
  if (parts.length != 2) 
    return false;
  try {
    const response = await fetch ("https://check-mail.proca.app/"+parts[1]);
    const r = await response.json();
    return r;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export default checkMail;
