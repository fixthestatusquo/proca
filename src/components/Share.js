import React from "react";
import Actions from "@components/layout/ShareButtons";
import {
  Container,
  IconButton,
  //  ButtonGroup,
  Button,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia,
  Avatar,
} from "@material-ui/core";
import { getMetadata } from "page-metadata-parser";
import { decodeHtmlEntities } from "@lib/text";
import uuid from "@lib/uuid";
import { addAction } from "@lib/server";
import Url from "@lib/urlparser";
import dispatch from "@lib/event";
import { useTranslation } from "react-i18next";
import { useComponentConfig } from "@hooks/useConfig";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import ShareIcon from "@material-ui/icons/Share";
import { useIsMobile } from "@hooks/useDevice";
import useData from "@hooks/useData";
import EmailConfirm from "@components/layout/EmailConfirm";
import PreviousStepConfirm from "@components/layout/PreviousStepConfirm";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  media: {
    height: 0,
    paddingTop: "52.5%", // FB ratio
  },
  root: {
    "& p": { fontSize: theme.typography.pxToRem(16) },
    "& h3": { fontSize: theme.typography.pxToRem(20) },
  },
  next: {
    margin: theme.spacing(1),
  },
}));

const Share = props => {
  const classes = useStyles();
  const component = useComponentConfig();
  const metadata = getMetadata(window.document, window.location);
  const { t } = useTranslation();

  metadata.title = decodeHtmlEntities(metadata.title);
  metadata.description = decodeHtmlEntities(metadata.description);

  const next = () => {
    if (props.done instanceof Function) props.done();
  };

  return (
    <Container component="div" maxWidth="sm" className={classes.root}>
      <EmailConfirm />
      <PreviousStepConfirm email={component.consent.email} />
      <h3>{t("share.title")}</h3>
      <p>{t("share.intro")}</p>
      <Card className={classes.root}>
        {component.share.top && <Actions {...props} />}
        <CardHeader title={metadata.title} subheader={metadata.provider} />
        {metadata.image ? (
          <CardMedia
            className={classes.media}
            image={metadata.image}
            title={metadata.title}
          />
        ) : null}
        <CardContent>
          <p>{metadata.description}</p>
        </CardContent>
        {!component.share.top && <Actions {...props} />}
        {component.share.next && (
          <Button
            size="large"
            endIcon={<SkipNextIcon />}
            className={classes.next}
            variant="contained"
            color="primary"
            onClick={next}
          >
            {t(
              typeof component.share.next === "string"
                ? component.share.next
                : "Next"
            )}
          </Button>
        )}
      </Card>
    </Container>
  );
};

export default Share;
