import React from 'react';
import Alert from "@components/Alert";
import { useCampaignConfig } from "@hooks/useConfig";
import useCount from "@hooks/useCount";
import { formatNumber } from "@components/ProgressCounter";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

const Closed = props => {
  const config = useCampaignConfig();
  const count = useCount(config.actionPage);
  if (config.component.widget?.closed !== true)
    return null;
  return (<Alert icon={<ThumbUpIcon fontSize="inherit" />} severity="success" autoHideDuration={null} title={formatNumber(count)}>Thank you - Благодаря ти - Hvala vam - Děkujib – Tack – Bedankt – Aitäh – Kiitos – Merci – Danke – ευχαριστώ – Kösz – Grazie – Paldies - Dziękuję Ci – Obrigado – Mulțumesc – Ďakujem - Hvala vam – Gracias</Alert>);
};

export default Closed;
