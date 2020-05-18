import React, { useEffect, useState } from "react";

import { Container, Grid } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import { makeStyles } from "@material-ui/core/styles";

import {
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  FormHelperText,
  Snackbar
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import SendIcon from "@material-ui/icons/Send";
import DoneIcon from "@material-ui/icons/Done";

import useForm from "react-hook-form";
import useGeoLocation from "react-ipgeolocation";
import useQueries from "react-use-queries";

import countries from "../data/countries.json";

import { addSignature } from "../lib/server.js";
import ProgressCounter from "./ProgressCounter.js";
import Url from "../lib/urlparser.js";
import uuid from "../lib/uuid.js";

let defaultValues = {
  firstname: "",
  lastname: "",
  email: "",
  postcode: "",
  country: "",
  comment: ""
};

defaultValues = { ...defaultValues, ...Url.data() };

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  bigHelper: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
    fontSize: "1em",
    width: "100%",
    color: "black",
    padding: "4px",
    lineHeight: "inherit"
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%"
  },
  "#petition-form": { position: "relative" },
  "@global": {
    "select:-moz-focusring": {
      color: "transparent",
      textShadow: "0 0 0 #000"
    },
    "input:valid + fieldset": {
      borderColor: "green",
      borderWidth: 2
    }
  }
}));

const queries = {
  //    '(max-width: 440px)': 'col-12',
  "(min-width: 570px)": false
};

export default function SignatureForm(props) {
  const classes = useStyles();
  const [status, setStatus] = useState("default");
  if (props.values) defaultValues = { ...defaultValues, ...props.values };
  const {
    register,
    handleSubmit,
    setValue,
    errors,
    setError,
    clearError,
    watch,
    formState
  } = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: defaultValues
  });
  //  const { register, handleSubmit, setValue, errors } = useForm({ mode: 'onBlur', defaultValues: defaultValues });

  const country = watch("country");
  const location = useGeoLocation({api:"https://country.proca.foundation"});
  if (location.country && !country) {
    setValue("country", location.country);
  }

  const options = {
    margin: props.margin || "dense",
    variant: props.variant || "filled"
  };
  //variant: standard, filled, outlined
  //margin: normal, dense

  //const selectValue = watch("select");
  //TODO async handleSubmit(async (data) => await fetchAPI(data))
  const onSubmit = async data => {
    data.tracking = Url.utm();
    const result = await addSignature(props.actionPage, data);
    console.log(result);
    if (result.errors) {
      result.errors.forEach(error => {
        console.log(error);
      });
      setStatus("error");
      return;
    }
    setStatus("success");
    uuid(result.addSignature); // set the global uuid as signature's fingerprint
    if (props.nextAction) props.nextAction();
    // sends the signature's ID as fingerprint
  };

  useEffect(() => {
    //    register({ name: "email" });
    register({ name: "country" });
  }, [register]);

  const [[compact = true], mediaQueryListener] = useQueries(queries);

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    // todo: workaround until the feature is native react-form ?
    inputs.forEach(input => {
      input.oninvalid = e => {
        setError(
          e.target.attributes.name.nodeValue,
          e.type,
          e.target.validationMessage
        );
      };
    });
  }, [register, setError]);

  const selectChange = e => {
    setValue("country", e.target.value);
  };
  const handleBlur = e => {
    e.target.checkValidity();
    if (e.target.validity.valid) {
      clearError(e.target.attributes.name.nodeValue);
      return;
    }
    //    setError(e.target.attributes.name.nodeValue, "aa"+e.target.attributes.name.nodeValue, e.target.validationMessage);
  };

  function Error(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            Sorry, we couldn't save your signature!
            <br />
            The techies have been informed.
          </Alert>
        </Snackbar>
      );
    return null;
  }

  function Success(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="success">Done, Thank you for your support!</Alert>
        </Snackbar>
      );
    return null;
  }

  if (status === "success") {
    return (
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DoneIcon color="action" fontSize="large" my={4} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  return (
    <form
      className={classes.container}
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
    >
      <ProgressCounter actionPage={props.actionPage} />
      <Success display={status === "success"} />
      <Error display={status === "error"} />
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12} sm={compact ? 12 : 6}>
            <TextField
              id="firstname"
              name="firstname"
              label="First Name"
              className={classes.textField}
              placeholder="eg. Leonardo"
              autoComplete="given-name"
              required
              inputRef={register}
              onBlur={handleBlur}
              error={!!(errors && errors.firstname)}
              helperText={
                errors && errors.firstname && errors.firstname.message
              }
              variant={options.variant}
              margin={options.margin}
            />
          </Grid>
          <Grid item xs={12} sm={compact ? 12 : 6}>
            <TextField
              id="lastname"
              name="lastname"
              label="Last Name"
              autoComplete="family-name"
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
              autoComplete="email"
              className={classes.textField}
              inputRef={register}
              onBlur={handleBlur}
              error={!!errors.email}
              helperText={errors && errors.email && errors.email.message}
              variant={options.variant}
              margin={options.margin}
              placeholder="your.email@example.org"
              required
            />
          </Grid>
          <Grid item xs={12} sm={compact ? 12 : 3}>
            <TextField
              id="postcode"
              name="postcode"
              label="Postal Code"
              autoComplete="postal-code"
              inputRef={register}
              className={classes.textField}
              variant={options.variant}
              margin={options.margin}
            />
          </Grid>
          <Grid item xs={12} sm={compact ? 12 : 9}>
            <TextField
              select
              id="country"
              name="country"
              label="Country"
              className={classes.textField}
              variant={options.variant}
              inputRef={register}
              //value={defaultValues.country}
              value={country}
              onChange={selectChange}
              InputLabelProps={{ shrink: country.length > 0 }}
              SelectProps={{
                native: true,
                MenuProps: {
                  className: classes.menu
                }
              }}
              margin={options.margin}
              required
            >
              <option key="" value=""></option>
              {countries.map(option => (
                <option key={option.iso} value={option.iso}>
                  {option.name}
                </option>
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
            <FormHelperText
              className={classes.bigHelper}
              error={errors.privacy}
              variant={options.variant}
              margin={options.margin}
            >
              I agree to OrganisationName contacting me about important
              campaigns *
            </FormHelperText>
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
                control={<Radio />}
                inputRef={register({ required: "Yes or No?" })}
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
              disabled={formState.isSubmitting}
              endIcon={<SendIcon />}
            >
              {" "}
              Sign!
            </Button>
            {mediaQueryListener}
          </Grid>
        </Grid>
      </Container>
    </form>
  );
}
