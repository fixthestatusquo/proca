import React, { useEffect, useState } from "react";
import TextField from "@components/field/TextField";
import { useTranslation } from "react-i18next";
const FilterArea = props => {
  const { t } = useTranslation();
  const [constituencies, setConstituencies] = useState(null);
  useEffect(() => {
    if (constituencies === null && props.profiles && props.profiles.length) {
      const d = new Set(props.profiles.map(d => d.constituency));
      setConstituencies([...d].sort());
      props.selecting("constituency", "");
    }
  }, [constituencies, props.profiles, props.selecting]);

  useEffect(() => {
    props.selecting();
  }, [props.selecting]); //can't put selecting

  /*  useEffect(() => {
    props.selecting(
      "constituency",
      area > 9 ? area.toString() : `0${area.toString()}`
    );
  }, [area]);
*/
  const onChange = e => {
    //    setData("constituency", e.target.value);
    props.selecting("constituency", e.target.value);
  };
  if (!constituencies) return null;
  return (
    <>
      <TextField
        select={true}
        name="constituency"
        required={true}
        label={t("Constituency")}
        form={props.form}
        onChange={onChange}
        SelectProps={{
          native: true,
        }}
      >
        <option key="empty" value="" />
        {constituencies.map(k => {
          return (
            <option key={k} value={k}>
              {k}
            </option>
          );
        })}
      </TextField>
    </>
  );
};

export default FilterArea;
