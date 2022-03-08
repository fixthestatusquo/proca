import { Grid, InputAdornment } from "@material-ui/core";
import TextField from "@components/TextField";
import { useTranslation } from "react-i18next";

const Move4Nature = (props) => {
  const { t } = useTranslation();
  const { compact, classes, form } = props;
  const activities = ["", "run", "ski", "bike", "swim", "skate"];
  return (
    <>
      <Grid item xs={12} sm={compact ? 12 : 6} className={classes.field}>
        <TextField
          form={form}
          name="activity"
          label={t("Activity") // i18next-extract-disable-line} 
          required
          select
          SelectProps={{
            native: true,
          }}
        >
          {activities.map((option) => (
            <option key={option} value={option}>
              {t(option)}
            </option>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={compact ? 12 : 6} className={classes.field}>
        <TextField
          form={form}
          min={1}
          type="number"
          step="1"
          pattern="\d+"
          name="distance"
          InputProps={{
            endAdornment: <InputAdornment position="end">km</InputAdornment>,
          }}
          required
          label={t("Distance") // i18next-extract-disable-line}
        />
      </Grid>
    </>
  );
};

export default Move4Nature;
