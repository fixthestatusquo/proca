import SingleSelect from "@components/field/SingleSelect";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const defaultRoles = [
  "Student",
  "PhD",
  "Researcher",
  "Head of institution",
  "Engineer",
  "Other",
];

const Role = ({ form }) => {
  const { t } = useTranslation();

  // campaign config can override the list via locales.{lang}["campaign:"].roles = "Student;PhD;Other"
  const configRoles = t("campaign:roles", "");
  const options = configRoles
    ? configRoles
        .split(";")
        .map(role => role.trim())
        .filter(Boolean)
        .map(role => ({ id: role, text: role }))
    : defaultRoles.map(role => ({
        id: role,
        text: t(`campaign:role.${role}`, role),
      }));

  return (
    <Grid item xs={12}>
      <SingleSelect
        form={form}
        name="role"
        defaultValue={options[0]?.id}
        label={t("campaign:role.label", "Role")}
        required
        options={options}
      />
    </Grid>
  );
};

export default Role;
