import useCount from "@hooks/useCount.js";

export default function Counter(props) {
  const count = useCount(props.actionPage) || props.count;
  console.log(
  return (count
    ? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, props.separator || "'")
    : null);
}
