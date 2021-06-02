import { Button, withStyles } from "@material-ui/core";
import useData from "../../../hooks/useData";
import useLayout from "../../../hooks/useLayout";

import React from 'react';

const StyledButton = withStyles((theme) => (
    {
        root: {
            // padding: theme.spacing(1),
            width: "100%",
            textAlign: "center",
            fontSize: theme.typography.fontSize * 1.25,
            fontWeight: theme.typography.fontWeightBold,
            "&:disabled": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.getContrastText(theme.palette.primary.main)
            }
        }
    }
))(Button);

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
        <StyledButton
            color="primary"
            size="large"
            disabled={amount === props.amount}
            disableElevation={amount === props.amount}
            variant={layout.button.variant}
            onClick={(e) => handleAmount(e, props.amount)}
            classes={props.classes}
        >
            {props.amount}&nbsp;{currency.symbol}
        </StyledButton>
    );
};


export default AmountButton;