import { Button, withStyles } from "@material-ui/core";
import useData from "../../../hooks/useData";

import React from "react";

const StyledButton = withStyles((theme) => ({
  root: {
    // padding: theme.spacing(1),
    width: "100%",
    textAlign: "center",
    fontSize: theme.typography.fontSize * 1.25,
    fontWeight: theme.typography.fontWeightBold,
  },
}))(Button);

const AmountButton = (props) => {
  const [data, setData] = useData();
  const currency = props.currency;
  const amount = data.amount;

  const handleAmount = (e, amount) => {
    setData("amount", amount);
    if (props.onClick) {
      props.onClick(e, props.amount);
    }
  };

  // todo: offer this as an option? color={amount === props.amount ? "primary" : "default"}
  return (
    <StyledButton
      size="large"
      name="amount"
      color="primary"
      aria-pressed={amount === props.amount}
      disableElevation={amount === props.amount}
      variant={amount === props.amount ? "contained" : "outlined"}
      onClick={(e) => handleAmount(e, props.amount)}
      classes={props.classes}
    >
      {props.amount}&nbsp;{currency.symbol}
    </StyledButton>
  );
};

export const OtherButton = (props) => {

  const selected = props.selected;

  return (<StyledButton
    color="primary"
    name="other"
    size="large"
    aria-pressed={selected}
    disableElevation={selected}
    classes={props.classes}
    variant={selected ? "contained" : "outlined"}
    {...props}>{props.children}</StyledButton>)

};

export default AmountButton;
