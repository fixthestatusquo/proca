const formatDate = (d) => {
  if (!d) return false;
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(d)) return d; // we accept YYYY-MM-DD
  if (d.length > 0) {
    if (d.length !== 10) {
      return false;
    }

    const dmj = d.split(/ |[./-]|\//);
    if (dmj.length !== 3) return false;
    return dmj[2] + "-" + dmj[1] + "-" + dmj[0];
  }
};

const parse = (date) => Date.parse(formatDate(date));

const isDate = (date) => {
  return !isNaN(parse(date));
  //  return /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.test(date);
};

export { formatDate, isDate, parse };
