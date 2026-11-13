import SingleSelect from "@components/field/SingleSelect";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const roles = [
  "Student",
  "Researcher",
  "Head of institution",
  "Engineer",
  "Other",
];

const Role = ({ form }) => {
  const { t } = useTranslation();

  return (
    <Grid item xs={12}>
      <SingleSelect
        form={form}
        name="role"
        defaultValue="Student"
        label={t("campaign:role.label", "Role")}
        required
        options={roles.map(role => ({
          id: role,
          text: t(`campaign:role.${role}`, role),
        }))}
      />
    </Grid>
  );
};

export default Role;
