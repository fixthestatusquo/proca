import React, { useEffect } from "react";

import { Container, Grid } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import {TextField,MenuItem, Radio, RadioGroup, FormControlLabel, Button} from "@material-ui/core";

import SendIcon from "@material-ui/icons/Send";

import useForm from "react-hook-form";

const defaultValues = {
  firstname: "",
  lastname: "",
  email: "",
  postcode: "",
  country: "",
  comment: ""
};

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

export default function SignatureForm(props) {
  const classes = useStyles();
  const { register, handleSubmit, setValue, errors } = useForm({
    mode: "onBlur",
    defaultValues: defaultValues
  });
  //  const { register, handleSubmit, setValue, errors } = useForm({ mode: 'onBlur', defaultValues: defaultValues });

  const options = {
    margin: props.margin || "dense",
    variant: props.variant || "filled"
  };
  //variant: standard, filled, outlined
  //margin: normal, dense

  //const selectValue = watch("select");
  const onSubmit = data => {
    console.log(data);
  };

  useEffect(() => {
    //    register({ name: "email" });
    //    register({ name: "country" });
  }, [register]);

  const handleChange = e => {
    //    setValue(e.target.attributes.name.nodeValue, e.target.value);
    //    setValues(e.target.attributes.name.nodeValue, e.target.value);
    //    console.log(values);
    console.log(e.target);
  };

  return (
    <form className={classes.container} onSubmit={handleSubmit(onSubmit)} method="post" url="http://localhost">
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              id="firstname"
              name="firstname"
              label="First Name"
              className={classes.textField}
              placeholder="eg. Leonardo"
              inputRef={register({ required: "* is a required field" })}
              error={!!(errors && errors.firstname)}
              helperText={errors && errors.firstname && errors.firstname.message}
              variant={options.variant}
              margin={options.margin}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="lastname"
              name="lastname"
              label="Last Name"
              className={classes.textField}
              variant={options.variant}
              margin={options.margin}
              inputRef={register}
              placeholder="eg. Da Vinci"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="email"
              name="email"
              type="email"
              label="Email"
              className={classes.textField}
              inputRef={register({ required: "* is a required field" })}
              error={!!(errors && errors.email)}
              helperText={errors && errors.email && errors.email.message}
              variant={options.variant}
              margin={options.margin}
              placeholder="your.email@example.org"
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              id="postcode"
              name="postcode"
              label="Postal Code"
              inputRef={register}
              className={classes.textField}
              variant={options.variant}
              margin={options.margin}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              select
              id="country"
              name="country"
              label="Country"
              className={classes.textField}
              variant={options.variant}
              inputRef={register}
              margin={options.margin}
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
              name="comment"
              className={classes.textField}
              multiline
              rowsMax="20"
              label="Comment"
              inputRef={register}
              variant={options.variant}
              margin={options.margin}
            />
          </Grid>
          <Grid item xs={12}>
            I agree to OrganisationName contacting me about important campaigns
          </Grid>
          <Grid item xs={12}>
            <RadioGroup aria-label="privacy consent" name="privacy" required>
              <FormControlLabel
                value="opt-in"
                inputRef={register}
                control={<Radio color="primary" />}
                label="Yes, keep me informed via email"
              />

              <FormControlLabel
                value="opt-out"
                inputRef={register}
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
              type="submit"
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
}

