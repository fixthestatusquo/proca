import { useData } from "../../../hooks/useData";
import useLayout from "../../../hooks/useLayout";
import React from 'react';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    toggle: {
        "&:disabled": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.getContrastText(theme.palette.secondary.main)
        }
    },
}));

const FrequencyButton = (props) => {
    const classes = useStyles();

    const layout = useLayout();
    const [data, setData] = useData();

    const handleFrequency = (i) => {
        setData("frequency", i);
    };
    const frequency = data.frequency;

    return (
        <Button
            classes={{ root: classes.toggle }}
            onClick={() => handleFrequency(props.frequency)}
            variant={layout.variant}
            color="secondary"
            disabled={props.frequency === frequency}
            disableElevation={props.frequency === frequency}
            value={props.frequency}
        >{props.children}</Button>)
}

export default FrequencyButton;
