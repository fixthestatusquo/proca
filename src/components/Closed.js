import React from "react";
import { useTranslation } from "react-i18next";
import useCount from "@hooks/useCount";
import { Container } from "@material-ui/core";

import Register from "@components/Register";
import TTag from "@components/TTag";

export default function SignatureForm(props) {
  const { t } = useTranslation();
  const count = useCount();
  return (
    <Container component="div" maxWidth="sm">
      <TTag message="campaign:closed" total={count} />
      <Register {...props} buttonText={t("action.stayInformed")} />
    </Container>
  );
}
