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
      ...(config.component.consultation.default || {})
      // format of default values:
      // "153167796": "153167801",
      // "153168305": [153168308, 153168309],
      // "153168311": [153168314, 153168315, 153168316],
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
