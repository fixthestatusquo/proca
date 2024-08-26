const formatNumber = (prefix, number) => "+" + prefix + " " + number;
const cleanNumber = (prefix, number) => {
  number.replace("+" + prefix, "").replace("00" + prefix, "");

  if (number.startsWith("+") || number.startsWith("00")) {
    throw new Error("not a phone number in the country " + prefix);
  }

  return number.replace(/\D/g, "");
};

const check = {
  DE: (number) => {
    const prefix = "49";
    const result = { is_error: true, number: number, error: "unkown error" };
    number = cleanNumber(prefix, number); // throw an error if not a german number
    result.number = formatNumber(prefix, number);
    if (number.length < 7) {
      result.error = "TOO_SHORT";
      return result;
    }
    if (number.length > 11) {
      result.error = "TOO_LONG";
      return result;
    }
    result.is_error = false;
    return result;
  },
};

const checkPhone = async (country, number) => {
  const result = { is_error: false, number: number };

  if (!number) return result;
  if (check[country]) {
    try {
      return check[country](number);
    } catch (e) {
      console.log("not a", country, "number");
    }
  }
  let url = "https://check-phone.proca.app";
  try {
    url = process.env.REACT_APP_CHECK_PHONE_API_URL;
  } catch (e) {
    console.error(e.message);
  }
  try {
    const response = await fetch(url + "/" + country + "/" + number);
    const r = await response.json();
    return r;
  } catch (e) {
    console.log(e);
    return result; // don't block submission if the service isn't reachable
  }
};

export default checkPhone;
export { checkPhone };
