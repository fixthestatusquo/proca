import React, { useState, useRef, createRef, useCallback } from "react";

import { scrollTo } from "@lib/scroll";

import {
  Image as KonvaImage,
  Layer,
  Stage,
} from "react-konva/lib/ReactKonvaCore";
import useImage from "use-image";
import Camera, { useUpload } from "./Camera";
import Hidden from "./Hidden";
import { IndividualSticker } from "./image/sticker";
import UploadPicture from "./image/Upload";
import SelectPicture from "./image/Select";
import ImageIcon from "@material-ui/icons/Image";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import { useCampaignConfig } from "@hooks/useConfig";
import { resize } from "@lib/image";

import {
  Grid,
  Step,
  Stepper,
  StepLabel,
  StepButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  ButtonGroup,
  CardContent,
  Card,
  CardHeader,
  Collapse,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Dialog from "@components/Dialog";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  imgsticker: {
    width: "66px",
    display: "inline",
  },
  sticker: {
    cursor: "copy",
  },
  accordion: {
    display: "block!important",
  },
  buttonGroup: {
    marginRight: theme.spacing(1),
  },
  dialog: {
    minWidth: theme.breakpoints.values.sm,
  },
  stickers: {
    maxWidth: theme.breakpoints.values.sm,
  },
}));

export default function ImageStickerComplete(props) {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const classes = useStyles();
  const [draw, setDraw] = useState(false);
  const [image, setImage] = useState(undefined);
  const [canvas, setCanvas] = useState(undefined);
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded] = useState(false);
  //  const data = props.form?.getValues();
  const handleClose = () => {
    setDraw(false);
    scrollTo({ delay: 300, selector: "#proca-image" });
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const uploadedCanvas = (canvas) => {
    setCanvas(canvas);
    setActiveStep(1);
  };

  return (
    <div>
      <Hidden name="hash" form={props.form} />
      <Hidden name="dimension" form={props.form} />
      <ImageOption image={image} setImage={setImage} setDraw={setDraw} />
      <Dialog
        name={config.campaign.title}
        maxWidth="lg"
        dialog={draw !== false}
        close={handleClose}
        hideBackdrop
      >
        <Stepper activeStep={activeStep}>
          <Step key={0}>
            <StepButton onClick={handleStep(0)}>
              <StepLabel>{t("image.select", "choose your picture")}</StepLabel>
            </StepButton>
          </Step>
          <Step key={1}>
            <StepButton>
              <StepLabel>{t("image.addSticker", "add stickers")}</StepLabel>
            </StepButton>
          </Step>
        </Stepper>
        {config.component.picture?.upload !== false && (
          <>
            <div hidden={activeStep !== 0} className={classes.dialog}>
              {t("image.options", "Would you like to")}
              <Accordion
                TransitionProps={{ unmountOnExit: true }}
                expanded={expanded === "upload"}
                onChange={handleChange("upload")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <ImageIcon color="primary" />
                  {t("image.upload", "Upload a picture")}
                </AccordionSummary>
                <AccordionDetails classes={{ root: classes.accordion }}>
                  <UploadPicture setCanvas={uploadedCanvas} />
                </AccordionDetails>
              </Accordion>
              <Accordion
                TransitionProps={{ unmountOnExit: true }}
                expanded={expanded === "webcam"}
                onChange={handleChange("webcam")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <PhotoCameraIcon color="primary" />
                  {t("image.takeTitle", "Take a picture with your phone")}
                </AccordionSummary>
                <AccordionDetails classes={{ root: classes.accordion }}>
                  <Camera setCanvas={uploadedCanvas} form={props.form} />
                </AccordionDetails>
              </Accordion>
              <Accordion
                TransitionProps={{ unmountOnExit: true }}
                expanded={expanded === "select"}
                onChange={handleChange("select")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <PhotoLibraryIcon color="primary" />
                  {t("image.select")}
                </AccordionSummary>
                <AccordionDetails classes={{ root: classes.accordion }}>
                  <SelectPicture setCanvas={uploadedCanvas} />
                </AccordionDetails>
              </Accordion>
            </div>
          </>
        )}
        {config.component.picture?.upload == false && (
          <>
            <SelectPicture setCanvas={uploadedCanvas} />
          </>
        )}
        <div hidden={activeStep !== 1} className={classes.dialog}>
          <ImageStickerKonva
            setImage={setImage}
            setDraw={setDraw}
            backgroundCanvas={canvas}
            form={props.form}
          />
        </div>
      </Dialog>
      {image && (
        <img
          alt="to send to the recipients"
          style={{ maxWidth: "100%" }}
          src={image}
        />
      )}
    </div>
  );
}

const ImageStickerKonva = (props) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const { setValue } = props.form;

  const [background] = useImage(
    config.component.sticker.baseUrl + "/" + config.component.sticker.picture,
    "anonymous",
    "origin"
  );
  let image = undefined;
  const [images, setImages] = useState([]);
  const canvasRef = useRef();
  const data = props.form?.getValues();
  const upload = useUpload(canvasRef, data);
  const classes = useStyles();
  let stickersData = config.component.sticker.data;

  if (props.backgroundCanvas) {
    image = new Image();
    image.src = props.backgroundCanvas.toDataURL();
  }

  if (config.component.sticker.baseUrl) {
    stickersData = stickersData.map((image) =>
      Object.assign({}, image, {
        url: config.component.sticker.baseUrl + "/" + image.url,
      })
    );
  }
  const addStickerToPanel = ({ src, width, x, y }) => {
    setImages((currentImages) => [
      ...currentImages,
      {
        width,
        x,
        y,
        src,
        resetButtonRef: createRef(),
      },
    ]);
  };

  const resetAllButtons = useCallback(() => {
    images.forEach((image) => {
      if (image.resetButtonRef.current) {
        image.resetButtonRef.current();
      }
    });
  }, [images]);

  const handleCanvasClick = useCallback(
    (event) => {
      if (event.target.attrs.id === "backgroundImage") {
        resetAllButtons();
      }
    },
    [resetAllButtons]
  );

  const handleSave = async (close) => {
    if (!close) close = true;
    canvasRef.current.find("Circle").forEach((d) => d.hide());
    canvasRef.current.find(".delete").forEach((d) => d.hide());
    const r = await upload();
    console.log("uploaded", r);
    //    r.hash;
    setValue("hash", r.hash);
    setValue("dimension", "[" + r.width + "," + r.height + "]");

    props.setImage(canvasRef.current.toCanvas().toDataURL("image/jpeg", 0.8));
    //    console.log(canvasRef.current.toDataUrl("jpeg",81));
    props.setDraw(!close);
  };

  const { width, height } = props.backgroundCanvas
    ? resize(props.backgroundCanvas)
    : resize(background);
  return (
    <>
      <Stage
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onTap={handleCanvasClick}
        ref={canvasRef}
      >
        <Layer>
          {!!image && (
            <KonvaImage
              image={image}
              height={height}
              width={width}
              id="backgroundImage"
            />
          )}
          {!image && (
            <KonvaImage
              image={background}
              height={height}
              width={height}
              id="backgroundImage"
            />
          )}
          {images.map((image, i) => {
            return (
              <IndividualSticker
                onDelete={() => {
                  const newImages = [...images];
                  newImages.splice(i, 1);
                  setImages(newImages);
                }}
                onDragEnd={(event) => {
                  image.x = event.target.x();
                  image.y = event.target.y();
                }}
                key={"sticker_" + i}
                image={image}
              />
            );
          })}
        </Layer>
      </Stage>
      <Card>
        <CardHeader
          subheader={t("image.addStickerTitle", "Click/Tap to add a sticker")}
        />
        <CardContent className={classes.stickers}>
          {stickersData.map((sticker, i) => {
            return (
              <span
                key={"sticker_" + i}
                className={classes.sticker}
                onMouseDown={() => {
                  addStickerToPanel({
                    src: sticker.url,
                    width: sticker.width,
                    x: 20 + Math.floor(Math.random() * width - 20),
                    y: 20 + Math.floor(Math.random() * height - 20),
                  });
                }}
              >
                <img
                  className={classes.imgsticker}
                  alt={sticker.alt}
                  src={sticker.url}
                  width={sticker.width}
                />
              </span>
            );
          })}
        </CardContent>
      </Card>
      <div>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSave}
          size="large"
        >
          {t("image.publish", "Looks good, publish!")}
        </Button>
        {config.test && (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => handleSave(false)}
            size="large"
          >
            Publish (debug)
          </Button>
        )}
      </div>
    </>
  );
};

const ImageOption = (props) => {
  const config = useCampaignConfig();
  const { image, setImage, setDraw } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const confirmOptOut = !(config.component?.consent?.benefit === false); // !(config.component.consent?.confirm === false); // by default we ask for confirmation, same as for Consent

  return (
    <Grid container spacing={1} justifyContent="space-between">
      <Grid item id="proca-image">
        {t("image.wanttoadd")}
      </Grid>
      <Grid item>
        <ButtonGroup
          variant="contained"
          color="primary"
          className={classes.buttonGroup}
        >
          <Button
            disableElevation={!!image}
            color={image === false ? "default" : "primary"}
            onClick={() => {
              setImage(undefined);
              setDraw(true);
            }}
          >
            {t("yes")}
          </Button>
          <Button
            variant="contained"
            onClick={() => setImage(false)}
            color={image ? "default" : "primary"}
          >
            {t("no")}
          </Button>
        </ButtonGroup>
      </Grid>
      {confirmOptOut && (
        <Collapse in={image === false}>
          <Alert severity="info" icon={<ImageIcon />}>
            <AlertTitle>{t("confirm", "Are you sure?")}</AlertTitle>
            <span>{t("image.benefit")}</span>
          </Alert>
        </Collapse>
      )}
    </Grid>
  );
};
