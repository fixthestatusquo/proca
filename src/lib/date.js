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

const isDate = (date) => {
  return /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.test(date);
};

const isValidDate = (value) => {
  const [ d, m, y ] = value.split('/');
  const date = new Date(`${m}/${d}/${y}`);
  return date.getDate() === date.getDate() && date <= new Date();
}
export { formatDate, isDate, isValidDate };
