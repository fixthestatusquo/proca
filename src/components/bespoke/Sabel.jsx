import React from "react";
import {
  useCampaignConfig,

} from "@hooks/useConfig";
import {

  Grid
} from "@material-ui/core";

import Questions from "@components/survey/Questions";
import i18next from "i18next";


const localizeQuestions = (t, config, lang = "en") => {

  const questions = config.component.survey.questions || []

  return questions.map((q) => {

    const result = {
      id: q.id,
      type: q.type,
      title: t(`campaign:fields.${q.id}.title`, q.title),
      attributeName: q.attributeName || String(q.id),
    };

    if (q.possibleAnswers) {
      result.possibleAnswers = q.possibleAnswers.map((opt) => ({
        id: opt.id,
        text: t(`campaign:fields.${q.id}.possibleAnswers.${opt.id}`, opt.text),
      }));
    }

    return result;
  });
};


const Sabel = ({ form }) => {
  const { t } = i18next;
  const config = useCampaignConfig();
  const lang = config.locale || "en";
  const questions = localizeQuestions(t, config, lang);
  return (
     <Grid item xs={12}>
    <Questions
      form={form}
      handleNext={() => console.log("Next step")}
      ids={questions.map(q => q.id)}
      questions={questions}
      />
      </Grid>
  );
};

export default Sabel;
