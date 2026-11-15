import Questions from "@components/survey/Questions";
import { localizeConfigQuestions } from "@components/survey/useQuestions";
import { useCampaignConfig } from "@hooks/useConfig";
import { Grid } from "@material-ui/core";

// like Main, but the questions come only from config.component.consultation.fields (no fetch)
const Index = props => {
  const config = useCampaignConfig();
  const questions = localizeConfigQuestions(config);

  return (
    <Grid item xs={12}>
      <Questions
        form={props.form}
        handleNext={props.handleNext}
        ids={
          config.component.consultation?.selection || questions.map(q => q.id)
        }
        questions={questions}
      />
    </Grid>
  );
};

export default Index;
