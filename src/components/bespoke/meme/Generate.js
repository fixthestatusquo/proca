import React, { useEffect } from "react";
import Email from "@components/Email";
import useData from "@hooks/useData";

const GenerateMeme = (props) => {
  const [data, setData] = useData();
  useEffect(() => {
    console.log(data);
    if (data.actionUrl) return;
    setData(
      "actionUrl",
      "https://w.proca.app/meme/08db305dd84671a8b4b384508877d939cbb24087c423b7774a2b2fce55e86196?url=https://together4forests.eu"
    );
  }, []);
  return <Email {...props} />;
};

export default GenerateMeme;
