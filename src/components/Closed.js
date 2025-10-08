import React from "react";
import { useTranslation } from "react-i18next";
import useCount from "@hooks/useCount";
import { Container, Box } from "@material-ui/core";
import { formatNumber } from "@components/ProgressCounter";
import Register from "@components/Register";
import TTag from "@components/TTag";

export default function SignatureForm(props) {
  const { t } = useTranslation();
  const count = useCount();

  if (!count) return null;

  return (
    <Container component="div" maxWidth="sm">
      <Box
        bgcolor="primary.main"
        color="primary.contrastText"
        borderRadius="borderRadius"
        p={1}
      >
        <TTag
          message="campaign:closed"
          total={formatNumber(count)}
        />
      </Box>
      <Register {...props} buttonText={t("action.stayInformed")} />
    </Container>
  );
}
