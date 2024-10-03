import React, { useEffect } from "react";

const HiddenField = props => {
  const { register, setValue } = props.form;
  const { name, value } = props;

  useEffect(() => {
    if (!value) return;
    setValue(name, value);
  }, [name, value, setValue]);

  return (
    <input
      type="hidden"
      {...register(props.name, { validate: props.validate })}
    />
  );
};

export default HiddenField;
