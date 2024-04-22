import { useEffect, useState } from "react";
import { useCampaignConfig } from "@hooks/useConfig";

const Counter = () => {
  //const countries = new Set();
  const [data, setData] = useState(null);
  const config = useCampaignConfig();

  const url =
    "https://static.proca.app/ep2024/" +
    config.campaign.name.replace("_citizen_", "_candidates_") +
    "-count.json";

  useEffect(() => {
    const fetchData = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw res.statusText;

      const d = await res.json();
      setData(d.data.actionPage.campaign.stats.supporterCount);
    };
    if (!url) return;
    fetchData(url);
  }, [url, setData]);

  console.log(data);
  return data;
};

export default Counter;
