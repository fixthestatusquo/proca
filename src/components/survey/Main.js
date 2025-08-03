import React from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import {
  Grid,
  LinearProgress
} from "@material-ui/core";
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
        handleNext={null}
        ids={questions.map(q => q.id)}
        questions={questions}
        />
      </Grid>
  );
};

export default Main;
