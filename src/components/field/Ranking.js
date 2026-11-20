import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Typography,
} from "@material-ui/core";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  list: {
    paddingTop: 0,
  },
  item: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(0.5),
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: theme.spacing(1),
  },
  rank: {
    minWidth: theme.spacing(4),
    fontWeight: "bold",
  },
  unranked: {
    color: theme.palette.text.disabled,
  },
}));

// items: [{ id, title }], in the order they come from the consultation
// value stored in the form: ordered array of item ids (as strings), most important first
// the value stays empty until the supporter moves an item or confirms the initial order,
// so a required ranking can't be submitted with the default order by accident
const Ranking = ({ form, name, label, items, required = false, children }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const defaultOrder = items.map(item => String(item.id));
  const titles = Object.fromEntries(
    items.map(item => [String(item.id), item.title])
  );

  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend">{label}</FormLabel>
      <FormHelperText>
        {t(
          "survey.ranking.help",
          "Use the arrows to put the items in order, most important first."
        )}
      </FormHelperText>
      <Controller
        name={name}
        control={form.control}
        rules={{
          validate: value =>
            !required ||
            (Array.isArray(value) && value.length === defaultOrder.length) ||
            t("survey.ranking.required", "Please rank the items"),
        }}
        render={({ field }) => {
          const ranked = Array.isArray(field.value) && field.value.length > 0;
          const order = ranked ? field.value.map(String) : defaultOrder;

          const move = (from, to) => {
            if (to < 0 || to >= order.length) return;
            const next = [...order];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            field.onChange(next);
          };

          return (
            <>
              <List dense className={classes.list}>
                {order.map((id, index) => (
                  <ListItem key={id} className={classes.item}>
                    <Typography
                      className={`${classes.rank} ${ranked ? "" : classes.unranked}`}
                    >
                      {ranked ? index + 1 : "–"}
                    </Typography>
                    <ListItemText primary={titles[id] || id} />
                    <IconButton
                      size="small"
                      aria-label={t("survey.ranking.up", "Move up")}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={t("survey.ranking.down", "Move down")}
                      disabled={index === order.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              {!ranked && (
                <Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => field.onChange(order)}
                  >
                    {t("survey.ranking.keep", "Keep this order")}
                  </Button>
                </Box>
              )}
            </>
          );
        }}
      />
      {children}
      {form.formState.errors[name] && (
        <FormHelperText error>
          {form.formState.errors[name].message}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default Ranking;
