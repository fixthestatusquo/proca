import { useData } from "../../../hooks/useData";
import useLayout from "../../../hooks/useLayout";
import React from 'react';
import { Button, withStyles } from '@material-ui/core';
import { purple } from "@material-ui/core/colors";

const StyledButton = withStyles((theme) => ({
    root: {
        padding: theme.spacing(1),
        width: "100%",
        textAlign: "center",
        "&:disabled": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.getContrastText(theme.palette.secondary.main)
        },
    },
    disabled: {}
}))(Button);

const FrequencyButton = (props) => {
    const layout = useLayout();
    const [data, setData] = useData();

    const handleFrequency = (i) => {
        setData("frequency", i);
    };
    const frequency = data.frequency;

    return (
        <StyledButton
            onClick={() => handleFrequency(props.frequency)}
            variant={layout.variant}
            color="secondary"
            disabled={props.frequency === frequency}
            disableElevation={props.frequency === frequency}
            value={props.frequency}
            classes={props.classes}
        >{props.children}</StyledButton>
    )
}


export default FrequencyButton;
