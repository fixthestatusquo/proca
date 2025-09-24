import React, {useRef} from "react";
import { useTranslation } from "react-i18next";
import useCount from "@hooks/useCount";
import { Container, Box } from "@material-ui/core";
import { formatNumber } from "@components/ProgressCounter";

import Register from "@components/Register";
import TTag from "@components/TTag";

export default function SignatureForm(props) {
  const { t } = useTranslation();
  const count = useCount();
  const total = useRef (null);
        //<TTag message="campaign:closed" total={formatNumber(count)} />
  return (
    <Container component="div" maxWidth="sm">
      <Box
        bgcolor="primary.main"
        color="primary.contrastText"
        borderRadius="borderRadius"
        p={1}
      >
        <TTag message="campaign:closed" total=<span ref={total} class='total'>AAA</span> />
      </Box>
      <Register {...props} buttonText={t("action.stayInformed")} />
    </Container>
  );
}
