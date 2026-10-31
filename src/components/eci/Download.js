
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import SaveIcon from "@material-ui/icons/SaveAlt";
import { useTranslation } from "react-i18next";
import { useCampaignConfig } from "@hooks/useConfig";
import useData from "@hooks/useData";
import uuid from "@lib/uuid.js";

const url = (data, param, config) => {
  let postcardUrl = `https://bffa-pdf.herokuapp.com/?qrcode=${uuid()}:${config.actionPage}:${data.country}&country=${data.country}`;
  if (data.extra_language) postcardUrl += `&lang=${data.extra_language}`;

  if (param?.pdfUrl)
    postcardUrl += `&pdf=${encodeURIComponent(param.pdfUrl)}`;
  if (param?.marginTop) postcardUrl += `&top=${param.marginTop}`;

  console.log(postcardUrl);

  return postcardUrl;
};

function Download() {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const [data] = useData();

  const handleDownload = () => {
    const href = url(data, {}, config);
    let target;
    try {
      target = new URL(href, window.location.href);
    } catch {
      console.error("invalid download url", href);
      return;
    }
    if (target.protocol !== "https:" && target.protocol !== "http:") {
      console.error("invalid download protocol", target.protocol);
      return;
    }
    const link = document.createElement("a");
    link.href = target.toString();
    link.target = "pdf";
    link.rel = "noopener noreferrer";
    link.click();
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
