import React from "react";

import { Button, makeStyles, MobileStepper, Paper } from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontSize: "1.25rem",
        '&$disabled': {
            color: theme.palette.action.disabled,
        }
    },
    lockIcon: {
        fontSize: theme.typography.fontSize
    },
    arrowIcon: {
        // color: theme.palette.primary.contrastText,
        color: 'inherit',
    },
    buttonRoot: {
        '&$disabled': {
            color: theme.palette.action.disabled
        },
        'color': theme.palette.primary.contrastText,
    }
}))

const Steps = (props) => {

    const classes = useStyles();

    const [activeStep, setActiveStep] = React.useState(0);
    const handleNext = () => { setActiveStep(activeStep === 1 ? 1 : activeStep + 1) };
    const handleBack = () => { setActiveStep(activeStep === 0 ? 0 : activeStep - 1) };


    return (
        <MobileStepper
            classes={{ root: classes.root }}
            indicatorColor="primary"
            variant="dots"
            position="static"

            steps={2}
            activeStep={activeStep}

            backButton={
                <>
                    <Button size="small" disabled={activeStep === 0} onClick={handleBack} disabled={activeStep === 0} classes={{ root: classes.buttonRoot }}>
                        <ArrowBackIcon classes={{ root: classes.arrowIcon }} />
                    </Button>
                    {activeStep === 0 ? "Choose amount" : "Payment"}
                </>
            }

            nextButton={
                <Button size="small" disabled={activeStep === 1} classes={{ root: classes.buttonRoot }} onClick={handleNext}>
                    <ArrowForwardIcon classes={{ root: classes.arrowIcon }} disabled={activeStep === 1} />
                </Button>
            }

        />
    )


};

export default Steps;