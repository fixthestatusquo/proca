import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SaveIcon from "@mui/icons-material/SaveAlt";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import uuid from "@lib/uuid.js";

const url = (data, param, config) => {
  let postcardUrl =
    "https://bffa-pdf.herokuapp.com/?" +
    "qrcode=" +
    uuid() +
    ":" +
    config.actionPage +
    ":" +
    data.country +
    "&country=" +
    data.country;
  if (data.extra_language) postcardUrl += "&lang=" + data.extra_language;

  if (param && param?.pdfUrl)
    postcardUrl += "&pdf=" + encodeURIComponent(param.pdfUrl);
  if (param && param?.marginTop) postcardUrl += "&top=" + param.marginTop;

  console.log(postcardUrl);

  return postcardUrl;
};

function Download() {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [data] = useData();

  const handleDownload = () => {
    window.open(
      url(data, {}, config),
      "pdf",
      "toolbar=0,status=0,width=548,height=775"
    );
    //    next();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {t("Thank you")}
        </Typography>
        <p>{t("Download explanation")}</p>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          startIcon={<SaveIcon />}
        >
          {t("Download")}
        </Button>
      </CardActions>
    </Card>
  );
}

export default Download;
export { url };
