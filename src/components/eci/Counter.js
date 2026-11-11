
import { useCampaignConfig } from "@hooks/useConfig";
import CounterI from "@components/Counter";

export default function Counter() {
  const config = useCampaignConfig();
  return <CounterI actionPage={config.component.eci.actionpage} />;
}
