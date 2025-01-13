import prefetch from './prefetchDNS';

const prefetchDNS = () => {
  prefetch (getUrl());
}

const formatNumber = (prefix, number) => "+" + prefix + " " + number;
const cleanNumber = (prefix, number) => {
  number = number.replace("+" + prefix, "").replace("00" + prefix, "");
  if (number.startsWith("+") || number.startsWith("00")) {
    throw new Error("not a phone number in the country " + prefix);
  }

  return number.replace(/\D/g, "");
};

const check = {
  DE: number => {
    const prefix = "49";
    const result = { is_error: true, number: number };
    number = cleanNumber(prefix, number); // throw an error if not a german number

    if (number.startsWith("0")) number = number.slice(1);
    const length = number.length;

    result.number = formatNumber(prefix, number);

    if (length < 8) {
      result.error = "TOO_SHORT";
      return result;
    }
    if (length > 11) {
      result.error = "TOO_LONG";
      return result;
    }
    result.is_error = false;
    result.country = "DE";
    return result;
  },
};

const getUrl = () => {
  let url = "https://check-phone.proca.app";
  try {
    url = process.env.REACT_APP_CHECK_PHONE_API_URL;
  } catch (e) {
    console.error(e.message);
  }
  return url;
}

const checkPhone = async (country, number) => {
  const result = { is_error: false, number: number };
  const url = getUrl();
  if (!number) return result;
  if (check[country]) {
    try {
      return check[country](number);
    } catch {
      console.log("not a", country, "number");
    }
  }
  try {
    let lastTwoDigits = undefined; // for privacy reasons, we hide the last two digits
    if (/\d{2}$/.test(number)) {
      lastTwoDigits = number.slice(-2);
      number = number.slice(0, -2) + "00";
      console.log(number); // Output the modified string
    }
    const response = await fetch(url + "/" + country + "/" + number);
    const r = await response.json();
    if (r.number && lastTwoDigits) {
      r.number = r.number.slice(0, -2) + lastTwoDigits;
    }
    return r;
  } catch (e) {
    console.log(e);
    return result; // don't block submission if the service isn't reachable
  }
};

export default checkPhone;
export { checkPhone, prefetchDNS };
