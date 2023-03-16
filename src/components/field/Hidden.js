import REACT, { useEffect } from "react";

const HiddenField = (props) => {
  const { register, setValue } = props.form;
  const { name, value } = props;

  useEffect(() => {
    console.log(name, value);
    setValue(name, value);
  }, [name, value]);
  return <input type="hidden" {...register(props.name)} />;
};

export default HiddenField;
