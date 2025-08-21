import { useEffect, useState } from "react";
import { useConfig } from "@hooks/useConfig";
import i18next from "i18next";

const localizeConfigQuestions = (config) => {
  const { t } = i18next;
  const questions = config?.component?.consultation.fields;
  if (!questions) return [];

  return questions.map((q) => {
    const result = {
      id: q.id,
      type: q.type,
      attributeName: q.attributeName || String(q.id),
      title: t(`campaign:fields.${q.id}.title`, q.title),
    };

    if (q.possibleAnswers) {
      result.possibleAnswers = q.possibleAnswers.map((opt) => ({
        id: opt.id,
        text: t(`campaign:fields.${q.id}.possibleAnswers.${opt.id}`, opt.text),
      }));
    }
    // overwriting the margin. By default is larger (for fetched fields)
    if (q.margin) result.margin = q.margin;

    return result;
  });
};

const useConsultJson = (name, lang = 'en') => {
  const config = useConfig();
  const [questions, setQuestions] = useState(undefined);
  const [loading, setLoading] = useState(!!name);
  const [error, setError] = useState(null);
  const url = `https://static.proca.app/survey/${name}/${lang}.json`;

 useEffect(() => {
  const fetchData = async () => {
    let remoteQuestions = [];

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("remote data", data);
      data.forEach(item => item.attributeName = String(item.id));
      remoteQuestions = data;
    } catch (err) {
      setError(err);
    }

    const configQuestions = localizeConfigQuestions(config);
    const merged = [...configQuestions, ...remoteQuestions];

    setQuestions(merged);
    setLoading(false);
  };

  if (!name) return;

  setLoading(true);

  const isRemoteDisabled = config?.component?.consultation?.remote === false;
  if (isRemoteDisabled) {
    const configQuestions = localizeConfigQuestions(config);
    setQuestions(configQuestions);
    setLoading(false);
    return;
  }

  fetchData();
}, [name, lang, config]);


  return {
    questions,
    loading,
    error,
  };
};

export default useConsultJson;
