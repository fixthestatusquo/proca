import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { Grid, LinearProgress } from "@material-ui/core";
import useQuestions from "@components/survey/useQuestions";
import Questions from "@components/survey/Questions";

const Main = props => {
  const config = useCampaignConfig();
  const lang = config.locale || "en";
  const { questions, loading } = useQuestions(config.campaign.name, lang);
  if (loading) return <LinearProgress />;

  return (
    <Grid item xs={12}>
      <Questions
        form={props.form}
        handleNext={props.handleNext ?? undefined}
        // config.component.consultation?.selection
        // selection of questions to disoplay on register with custom component
        ids={config.component.consultation?.selection || questions.map(q => q.id)}
        questions={questions}
      />
    </Grid>
  );
};

export default Main;
