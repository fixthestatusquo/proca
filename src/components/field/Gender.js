import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Select from "./Select";

const Gender = ({ form, compact, classField, required }) => {
  const { t } = useTranslation();
  const short = {
    female: "♀",
    male: "♂",
    trans: "⚧",
    na: "–",
  };
  // the widget only loads the current language, so untranslated languages get the english names
  const names = t("common:gender", {
    returnObjects: true,
    defaultValue: {
      female: "Female",
      male: "Male",
      trans: "Trans",
      na: "Prefer not to say",
    },
  });
  // key = value submitted, value = symbol + name shown in the list, short = symbol only once selected
  let genders = Object.fromEntries(
    Object.entries(typeof names === "object" ? names : {}).map(([k, v]) => [
      k,
      short[k] ? `${short[k]} ${v}` : v,
    ])
  );
  // required: Select pre-selects the first entry, so start with an empty one
  if (required) genders = { "": "", ...genders };
  const width = () => (!compact ? 2 : 12);

  return (
    <Grid item xs={width()} sm={width()} className={classField}>
      <Select
        name="gender"
        label="⚤"
        select="key"
        form={form}
        required={required}
        // narrow (2/12) field: only the symbol fits once selected; compact is a full row, keep the full text
        short={compact ? undefined : short}
        options={genders}
      />
    </Grid>
  );
};

export default Gender;
