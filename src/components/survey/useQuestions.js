import React, { useEffect, useState } from "react";
const useConsultJson = (name,lang) => {
  const [questions, setQuestions] = useState(undefined);
  const [loading, setLoading] = useState(!!name);
  const [error, setError] = useState(null);

 useEffect(() => {
  const url =`https://static.proca.app/survey/${name}/${lang}.json`
  const fetchData = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // EC attributeNames are not unique, so we generate them from IDs
      data.forEach(item => item.attributeName = String(item.id));
      setQuestions(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!name) return undefined;
  fetchData();
}, [name,lang]);

  return {
    questions,
    loading,
    error
  };
};


export default useConsultJson;
