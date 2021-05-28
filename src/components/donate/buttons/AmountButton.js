import { Button } from "@material-ui/core";
import useData from "../../../hooks/useData";
import useLayout from "../../../hooks/useLayout";

import React from 'react';

const AmountButton = (props) => {

    const [data, setData] = useData();
    const layout = useLayout();

    const amount = data.amount;

    const handleAmount = (e, amount) => {
        setData("amount", amount);
        if (props.onClick) {
            props.onClick(e, props.amount)
        }
    };

    const currency = data.currency;

    return (
        <Button
            color="primary"
            size="large"
            disabled={amount === props.amount}
            disableElevation={amount === props.amount}
            variant={layout.variant}
            onClick={(e) => handleAmount(e, props.amount)}
            className={props.className}
        >
            {props.amount}&nbsp;{currency.symbol}
        </Button>
    );
};

export default AmountButton;