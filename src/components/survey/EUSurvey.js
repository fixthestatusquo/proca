import React, { useState } from "react";
import useData from "@hooks/useData";
import Register from "@components/Register";
import { useCampaignConfig, useSetActionType } from "@hooks/useConfig";
import { useForm } from "react-hook-form";
import { Stepper, Step, StepButton } from "@material-ui/core";

import SurveyStep from "@components/survey/Questions";
import Country from "@components/field/Country";
import useConsultJson from "@components/survey/useQuestions";
import { useTranslation } from "react-i18next";

const Consultation = props => {
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

  const handleStepClick = step => setActiveStep(step);
  const handleNext = () => setActiveStep(prev => prev + 1);

 const normalizeDefaults = (def) =>
  Object.fromEntries(
    Object.entries(def).map(([key, value]) => {
      if (value?.multilingual) {
        return [key, t(`campaign:${key}`, value.multilingual)];
      }
      return [key, value];
    })
  );

const d = config.component.consultation?.default || {};
const def = normalizeDefaults(d);

  const form = useForm({
    defaultValues: Object.assign({}, data, {
      language: config.locale,
      ...def
      // format of default values (arrays for multiselect, single value for single select, text for textfield):
      // "153167796": "153167801",
      // "153168305": [153168308, 153168309],
      // "153168311": [153168314, 153168315, 153168316],
    }),
  });

  const prepareData = data => {
    return data;
  };

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
          {(config.component.consultation.country !== false) &&
            <Country form={form} />
          }
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
        />
      )}
    </>
  );
};

export default Consultation;
