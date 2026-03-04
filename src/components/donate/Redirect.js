const tokenize = (string, data) => {
  const url = donateConfig.external.url
    .replace("{lang}", config.lang)
    .replace("{email}", formData.email || "")
    .replace("{lastname}", formData.lastname || "")
    .replace("{firstname}", formData.firstname || "")
    .replace("{postcode}", formData.postcode || "")
    .replace("{locality}", formData.locality || "")
    .replace("{country}", formData.country || "")
    .replace("{amount}", formData.amount || "")
    .replace("{amountcent}", formData.amount ? formData.amount * 100 : "");
};

const DonateRedirect = () => {
  return "aaa";
};
export default DonateRedirect;
