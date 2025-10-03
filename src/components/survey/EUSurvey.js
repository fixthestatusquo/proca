import React, { useState } from "react";
import useData from "@hooks/useData";
import Register from "@components/Register";
import {
  useCampaignConfig,
  useSetActionType,
} from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { Stepper, Step, StepButton } from "@material-ui/core";

import SurveyStep from "@components/survey/Questions";
import Country from "@components/field/Country";
import useConsultJson from "@components/survey/useQuestions";
import { useTranslation } from "react-i18next";

const Consultation = (props) => {

  const { t } = useTranslation();
  const steps = [t("survey", "Survey"), t("submit", "Submit")];
  const [activeStep, setActiveStep] = useState(0);
  const [data] = useData();
  useSetActionType("consultation");
  const config = useCampaignConfig();
  const qids = config.component.consultation.steps || {};

  const { questions, error } = useConsultJson(
    config.component.consultation.name || config.campaign.name,
    config.lang
  );

  const handleStepClick = (step) => setActiveStep(step);
  const handleNext = () => setActiveStep((prev) => prev + 1);

  const form = useForm({
    defaultValues: Object.assign({}, data, {
      language: config.locale,

      "154309564": "154309565",
      "154309695": "154309697",
      "154309698": "154309699"
      // "153167796": "153167801",
      // "153168305": [153168308, 153168309],
      // "153168311": [153168314, 153168315, 153168316],
      // "153168325": [153168329, 153168330],
      // "153168348": [153168356, 153168359],
      // "153168379": [153168381, 153168382, 153168383],
      // "153168405": [153168410],
      // "153168420": [153168425, 153168429, 153168431],
      // "153168447": [153168456],
      // "153168458": [153168459, 153168461, 153168462],
      // "153168469": [153168470, 153168471, 153168474],
      // "153168516": [153168521],
      // "153168539": [153168542, 153168543, 153168546],
      // "153168551": "153168552",
      // "153168556": "153168557",
      // "153168570": "153168571",
      // "153168578": [153168581, 153168582],
      // "153168584": [153168585, 153168586, 153168587],
      // "153168596": [153168599,153168600,153168602]
    }),
  });

  const prepareData = (data) => {
    console.log("prepareData", data);
    return data;
  };
  const onClick = () => console.log("onClick");

  // @ivana, not used const isValid = Object.keys(form.formState.errors).length === 0;

  if (error) return <p>Error loading consult: {error.message}</p>;

  return (
    <>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        style={{ width: "100%", backgroundColor: "transparent" }}
        nonLinear
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepButton onClick={() => handleStepClick(index)}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>

      {/* Only the citizen survey step */}
      {activeStep === 0 && (
        <>
        <Country
        form={form}
        />
        <SurveyStep
          form={form}
          handleNext={handleNext}
          questions={questions}
          ids={qids["citizen"]?.questions}
          />
          </>
      )}

      {/* Register step */}
      {activeStep === 1 && (
        <Register
          form={form}
          buttonText={t("action.consultation", "Send")}
          done={props.done}
          beforeSubmit={prepareData}
          onClick={onClick}
        />
      )}
    </>
  );
};

export default Consultation;
