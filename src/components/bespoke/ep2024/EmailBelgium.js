import React from "react";
import Email from "@components/Email";
import { useCampaignConfig } from "@hooks/useConfig";
import { imports } from "../../../actionPage";
import { useForm } from "react-hook-form";
import ProgressCounter from "@components/ProgressCounter";
import { Container } from "@material-ui/core";

const EmailBrussels = (props) => {
  const config = useCampaignConfig();
  const AreaFilter = imports.bespoke_filter_Belgium
    ? imports.bespoke_filter_Belgium
    : () => null;
  const form = useForm({
    mode: "onBlur",
    //    nativeValidation: true,
  });

  return (
    <Container maxWidth="sm">
      <ProgressCounter actionPage={config.actionPage} />
      <AreaFilter
        form={form}
        country={props.country}
        selecting={props.selecting}
      />
      <Email {...props} />
    </Container>
  );
};

export default EmailBrussels;
