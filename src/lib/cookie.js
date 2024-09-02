export const getCookie = (name) => {
  try {
    const r = document.cookie
      ?.split(";")
      .find((d) => d.trim().startsWith(`${name}=`));
    return r ? decodeURIComponent(r.split("=")[1]) : null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const setCookie = (name, value = "", days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie =
    `${name}=${value}; ${expires}; path=/; sameSite=Lax; Secure`;
};
