import React from "react";
import useData from "@hooks/useData";
import { useStyles } from "@components/Register";
import { useCompactLayout } from "@hooks/useElementWidth";
import {
  useCampaignConfig,
} from "@hooks/useConfig";
import {
  Grid,
} from "@material-ui/core";
import NameField from "@components/field/Name";
import Address from "@components/field/Address";

import SurveyStep from "@components/survey/Questions";

const AboutYou = ({ form, handleNext, questions }) => {
  const classes = useStyles();
  const [data] = useData();
  const config = useCampaignConfig();
  const isValid = Object.keys(form.formState.errors).length === 0;
  const classField = data.uuid && isValid ? classes.hidden : classes.field;
  const qids = config.component.consultation.steps.you.questions;
  const compact = useCompactLayout("#proca-contact", 380);
  return (
    <>
      <Grid container spacing={1} id="proca-contact">
        <NameField form={form} compact={compact} classField={classField} />
        <Address form={form} compact={compact} classField={classField} />
      </Grid>
      <SurveyStep
        form={form}
        handleNext={handleNext}
        questions={questions}
        ids={qids}
      />
    </>
  );
};

export default AboutYou;
