import React from "react";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const Steps = (props) => {
    const [value, setValue] = React.useState("amount");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Tabs
            value={value}
            indicatorColor="primary"
            variant="fullWidth"
            textColor="primary"
            aria-label="disabled tabs example"
            handleChange={handleChange}
        >
            <Tab label="Amount" value="amount" />
            <Tab label="Payment" value="payment" />
        </Tabs>
    )


};

export default Steps;