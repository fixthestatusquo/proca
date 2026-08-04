import React from "react";
import { generate } from "eu-payment-qr";
import QRCode from "react-qr-code";
import { Button, Box } from "@material-ui/core";
import uuid from "@lib/uuid";

import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import { useTranslation } from "react-i18next";
import DonationIcon from "@images/Donate";

const SepaQRCode = () => {
  const config = useCampaignConfig();
  const [data] = useData();
  const { t } = useTranslation();
  // Generate an EPC string from payment data
  const epc = generate({
    recipient: config.component.donation?.recipient || config.org.name,
    iban: config.component.donation?.iban,
    amount: data.amount,
    reference: `PROCA-{uuid()}`,
  });

  return (
    <Box px={1} pb={1}>
      (if on mobile)
      <Button
        size="large"
        fullWidth
        endIcon={<DonationIcon />}
        variant="contained"
        color="secondary"
        href={`epc-qr://${encodeURIComponent(epc)}`}
      >
        {t(["action.donate", "donation.to"], { organisation: config.org.name })}
      </Button>
      <QRCode value={epc} />
    </Box>
  );
};

export default SepaQRCode;
