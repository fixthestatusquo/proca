import React,{useState} from 'react';
import useForm from "react-hook-form";

import {
    TextField as LayoutTextField,
    Grid,
    Typography,
  Button,
  Container
} from "@material-ui/core";
import TextField from "./TextField";

//import Autocomplete from '@material-ui/lab/Autocomplete';
import { loadStripe } from '@stripe/stripe-js';

import {useLayout} from '../hooks/useLayout';
import useElementWidth from "../hooks/useElementWidth";
//import {useCampaignConfig} from "../hooks/useConfig";
import useData from "../hooks/useData";
import { useTranslation } from "react-i18next";
//import SendIcon from "@material-ui/icons/Send";
import LockIcon from '@material-ui/icons/Lock';

import {
  Elements,
  useElements,
  CardElement,
  IbanElement,
} from "@stripe/react-stripe-js";
import StripeInput from "./StripeInput";

const publishableKey="pk_test_51HLPbyFFsfkkXAxwgFLCJfIWJwuNvzA867Arg1lH4Woqhcq0yEWMtCwx4j2lqML9dCPK3oPH0NQyiAPux3K8JZUw00MxrWkh7u";

const stripe = loadStripe(publishableKey);

const currencies = [
    {
        "symbol": "€",
        "name": "Euro",
        "symbol_native": "د.إ.‏",
        "decimal_digits": 2,
        "rounding": 0,
        "code": "EUR",
        "name_plural": "Euros"
    }
];


const PaymentForm = () => {
 const layout = useLayout();
    const { t } = useTranslation();

    const [data, setData] = useData();
  const form = useForm({
    defaultValues: {name: data.firstname + " " + data.lastname}
  });

  const [compact, setCompact] = useState(true);
    const width = useElementWidth("#proca-donate");

  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

 
    const formValues = {};
    const dispatch = (d) => {
      console.log("dispatch",d);
    }
  const elements = useElements();

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
    }
  };

const StripeCard = (props) =>{
  //hidePostalCode=true
  return (
        <Grid item xs={12}>
            <LayoutTextField
                name="stripe"
    label=""
                  variant={layout.variant}
              margin={layout.margin}

                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    inputComponent: StripeInput,
                    inputProps: {
                        component: CardElement
                    },
                }}
            />
        </Grid>
  );
}
const StripeIBAN = (props) =>{
//  supportedCountries: ['SEPA'],
  return (
        <Grid item xs={12}>
            <LayoutTextField
                name="IBAN"
    label=""
                  variant={layout.variant}
              margin={layout.margin}

                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    inputComponent: StripeInput,
                    inputProps: {
                        component: IbanElement,

                    },
                }}
            />
        </Grid>
  );
}

    return <>
            <Grid item xs={12} >
            <TextField
              form={form}
              name= "Name"
              label={t("Full Name")}
              autoComplete="given-name"
              required
            />
</Grid>
          <Grid item xs={12} sm={compact? 12:9}>
            <TextField
              form={form}
              name="email"
              type="email"
              label={t("Email")}
              autoComplete="email"
              placeholder="your.email@example.org"
              required
            />
          </Grid>
          <Grid item xs={12} sm={compact ? 12 : 3}>
            <TextField
              form={form}
              name="postcode"
              label={t("Postal Code")}
              autoComplete="postal-code"
            />
          </Grid>

  <StripeCard />
            <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              size="large"
              startIcon={<LockIcon />}
            >
             Donate
            </Button>
          </Grid>

    </>

}

const PaymentFormWrapper = (props) => {
return (
          <Container component="main" maxWidth="sm" id="proca-donate">
        <Grid container spacing={1}>
    <Elements stripe={stripe}>
  <PaymentForm {...props} />
  </Elements>
        </Grid>
      </Container>
)}

export default PaymentFormWrapper;

