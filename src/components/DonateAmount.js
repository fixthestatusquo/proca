import React, {useState } from "react";
import {useCampaignConfig} from "../hooks/useConfig";
import useData from "../hooks/useData";
import {useLayout} from '../hooks/useLayout';
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardMedia,
  CardHeader,
  CardActions,
  CardContent,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  Button, ButtonGroup } from "@material-ui/core";

import PaymentIcon from '@material-ui/icons/Payment';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import PaypalIcon from '../images/Paypal.js';
import usePaypal from '../hooks/usePaypal';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const DonateAmount = (props) => {
  //const { t } = useTranslation();
  const classes = useStyles();
 const layout = useLayout();
 
  const config = useCampaignConfig();
  const [data, setData] = useData();
  const [amount,setAmount] = useState(data.amount);

  const title =  amount 
    ?config?.component?.DonateAmount.igive || "I'm donating "+amount+"€"
    :config?.component?.DonateAmount.title || "Choose your donation amount";
//    "I'm donating";
  const subtitle = config?.component?.DonateAmount.subTitle || "The average donation is 8.60€";
  const image = config?.component?.DonateAmount.image;

  const selection= config?.component?.DonateAmount?.oneoff?.default || [3,5];
  const currency = config?.component?.DonateAmount?.currency || {"symbol":"€","code":"EUR"};

  usePaypal({currency:currency});
const choosePaymentMethod = (m) =>{
  console.log("choose payment",m);
  setData("paymentMethod",m);
////////////////  props.done();
}


  const AmountButton= (props) => (<Button color="primary" disableElevation={amount===props.amount} variant="contained" onClick={() => setAmount(props.amount)}>{props.amount}&nbsp;{currency.symbol}</Button>);

  return (
      <Card>
        <CardHeader title={title} subheader={subtitle} />

        {image ? (
          <CardMedia
            image={image}
            title={title}
          />
        ) : null}
        <CardContent>
    <div className={classes.root}>
    {selection.map( d => (<AmountButton key={d} amount={d} />))}
    </div>
        <FormControl fullWidth>
          <InputLabel shrink= {amount > 0} htmlFor="amount">Amount</InputLabel>
          <Input
            id="amount"
    variant={layout.variant}
                  margin={layout.margin}
    onChange={e => setAmount(e.target.value)}
    value={amount || ""}
            endAdornment={<InputAdornment position="end">€</InputAdornment>}
          />
        </FormControl>
        </CardContent>
        <CardActions>
  <ButtonGroup variant="contained" aria-label="Select Payment method">
  <Button color="primary" disabled={!amount} startIcon={<PaymentIcon />} onClick={() => {choosePaymentMethod("creditcard")}}>Credit Card</Button>
  <Button disabled={!amount} onClick={() => choosePaymentMethod("sepa")} startIcon={<AccountBalanceIcon/>}>SEPA</Button>
  <Button disabled={!amount} startIcon={<PaypalIcon /> } 
    onClick={() => choosePaymentMethod("paypal")}>Paypal</Button>
    </ButtonGroup>
    <div id="paypal-container"></div>
        </CardActions>
      </Card>

)
};
export default DonateAmount;

