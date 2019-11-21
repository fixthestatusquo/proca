import React from "react";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import { makeStyles } from "@material-ui/core/styles";

import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import Button from "@material-ui/core/Button";
import SendIcon from "@material-ui/icons/Send";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%"
  }
}));

const countries = [
  {
    name: "Switzerland",
    iso: "CH"
  },
  {
    name: "France",
    iso: "FR"
  }
];

export default function SignatureForm() {
  const classes = useStyles();
  const options = { margin: "dense", variant: "filled" };
  //variant: standard, filled, outline
  //margin: normal, dense

  const [values, setValues] = React.useState({
    email: "",
    contry: ""
  });

  //  const fields= {};

  const handleChange = name => event => {
    console.log(event);
    setValues({
      ...values,
      [name]: event.target.value
    });
  };

  return (
    <form className={classes.container} noValidate>
      <Container component="main" maxWidth="sm">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              id="firstname"
              label="First Name"
              className={classes.textField}
              placeholder="eg. Leonardo"
              variant={options.filled}
              margin={options.margin}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="lastname"
              label="Last Name"
              className={classes.textField}
              variant={options.filled}
              margin={options.margin}
              placeholder="eg. Da Vinci"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="email"
              type="email"
              label="Email"
              className={classes.textField}
              variant="filled"
              margin="dense"
              value={values.email}
              onChange={handleChange("email")}
              placeholder="your.email@example.org"
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              id="postcode"
              label="Postal Code"
              className={classes.textField}
              variant="filled"
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              id="country"
              name="country"
              select
              label="Country"
              className={classes.textField}
              variant="filled"
              value={values.country}
              onChange={handleChange("country")}
              margin="dense"
              required
            >
              {countries.map(option => (
                <MenuItem key={option.iso} value={option.iso}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="comment"
              className={classes.textField}
              multiline
              rowsMax="20"
              label="Comment"
              variant="filled"
              margin="dense"
            />
          </Grid>
          <Grid item xs={12}>
            I agree to OrganisationName contacting me about important campaigns
          </Grid>
          <Grid item xs={12}>
            <RadioGroup
              aria-label="privacy consent"
              name="privacy"
              required
              value={values.gdpr}
              onChange={handleChange}
            >
              <FormControlLabel
                value="opt-in"
                control={<Radio color="primary" />}
                label="Yes, keep me informed via email"
              />

              <FormControlLabel
                value="opt-out"
                control={<Radio />}
                label="No, don't send me emails or keep me updated in future"
              />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            Your personal information will be kept private and held securely. By
            submitting information you are agreeing to the use of data and
            cookies in accordance with our privacy policy.
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              size="large"
              endIcon={<SendIcon />}
            >
              {" "}
              Sign!
            </Button>
          </Grid>
        </Grid>
      </Container>
    </form>
  );
  // country
  // GDPR
}

//export default signatureForm;
