import { Box } from "@material-ui/core";
import React from 'react';

const PaymentBox = ({ children }) => {
    return (
        <Box marginTop={1} marginRight={3} marginBottom={1} marginLeft={3}>
            {children}
        </Box>
    )
}

export default PaymentBox;