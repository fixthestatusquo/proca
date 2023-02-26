import React, { useState, useRef, createRef, useCallback } from "react";
import {
  Image as KonvaImage,
  Layer,
  Stage,
} from "react-konva/lib/ReactKonvaCore";
import useImage from "use-image";
import { useUpload } from "./Camera";
import { IndividualSticker } from "./image/IndividualStickers";
import UploadPicture from "./image/Upload";
import Camera from "./Camera";
import ImageIcon from "@material-ui/icons/Image";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import { useCampaignConfig } from "@hooks/useConfig";
import {
  Grid,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  StepButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  ButtonGroup,
  CardContent,
  Card,
  CardHeader,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Dialog from "@components/Dialog";
import { useTranslation } from "react-i18next";

export default function ImageStickerComplete(props) {
  const { t } = useTranslation();
  const [draw, setDraw] = useState(false);
  const [image, setImage] = useState(undefined);
  const [canvas, setCanvas] = useState(undefined);
  const handleClose = () => setDraw(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [expanded, setExpanded] = React.useState(false);

  const handleChange =
    (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const uploadedCanvas = (canvas) => {
    setCanvas(canvas);
    setActiveStep(1);
  };

  return (
    <div>
      <ImageOption image={image} setImage={setImage} setDraw={setDraw} />
      <Dialog
        name="Restore nature"
        fullScreen={false}
        maxWidth="lg"
        dialog={draw !== false}
        close={handleClose}
      >
        <Stepper activeStep={activeStep} nonLinear>
          <Step key={0}>
            <StepButton onClick={handleStep(0)}>
              <StepLabel>{t("image.select", "choose your picture")}</StepLabel>
            </StepButton>
          </Step>
          <Step key={1} onClick={handleStep(1)}>
            <StepButton onClick={handleStep(1)}>
              <StepLabel>{t("image.addSticker", "add stickers")}</StepLabel>
            </StepButton>
          </Step>
        </Stepper>
        <div hidden={activeStep !== 0}>
          Would you like to :
          <Accordion
            TransitionProps={{ unmountOnExit: true }}
            expanded={expanded === "upload"}
            onChange={handleChange("upload")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ImageIcon color="primary" />
              Upload a picture
            </AccordionSummary>
            <AccordionDetails>
              <UploadPicture uploadedCanvas={uploadedCanvas} />
            </AccordionDetails>
          </Accordion>
          <Accordion
            TransitionProps={{ unmountOnExit: true }}
            expanded={expanded === "webcam"}
            onChange={handleChange("webcam")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <PhotoCameraIcon color="primary" />
              Take a picture with your phone now
            </AccordionSummary>
            <AccordionDetails>
              <Camera form={props.form} />
            </AccordionDetails>
          </Accordion>
          <Accordion
            TransitionProps={{ unmountOnExit: true }}
            expanded={expanded === "select"}
            onChange={handleChange("select")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <PhotoLibraryIcon color="primary" />
              Select one of our pictures
            </AccordionSummary>
            <AccordionDetails>Coming soon...</AccordionDetails>
          </Accordion>
        </div>
        <div hidden={activeStep !== 1}>
          <ImageStickerKonva
            setImage={setImage}
            setDraw={setDraw}
            backgroundCanvas={canvas}
          />
        </div>
      </Dialog>
      {image && (
        <img
          alt="to send to the recipients"
          style={{ "max-width": "100%" }}
          src={image}
        />
      )}
    </div>
  );
}

const ImageStickerKonva = (props) => {
  const config = useCampaignConfig();
  const max_size = 640;
  const { t } = useTranslation();

  const [background] = useImage(
    config.component.sticker.baseUrl + "/" + config.component.sticker.picture,
    "anonymous",
    "origin"
  );
  let image = undefined;
  if (props.backgroundCanvas) {
    image = new Image();
    image.src = props.backgroundCanvas.toDataURL();
  }

  const [images, setImages] = useState([]);
  const canvasRef = useRef();
  const upload = useUpload(canvasRef, max_size);

  let stickersData = config.component.sticker.data;
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
      console.log(event.target.attrs);
      if (event.target.attrs.id === "backgroundImage") {
        resetAllButtons();
      }
    },
    [resetAllButtons]
  );

  const handlePublish = async () => {
    const r = await upload();
    console.log("uploaded", r);
  };

  const handleSave = async () => {
    props.setImage(canvasRef.current.toCanvas().toDataURL("image/jpeg", 0.8));
    //    console.log(canvasRef.current.toDataUrl("jpeg",81));
    props.setDraw(false);
  };

  return (
    <>
      <Stage
        width={600}
        height={400}
        onClick={handleCanvasClick}
        onTap={handleCanvasClick}
        ref={canvasRef}
      >
        <Layer>
          {!!image && (
            <KonvaImage
              image={image}
              height={400}
              width={600}
              id="backgroundImage"
            />
          )}
          {!image && (
            <KonvaImage
              image={background}
              height={400}
              width={600}
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
                key={i}
                image={image}
              />
            );
          })}
        </Layer>
      </Stage>
      <Card>
        <CardHeader
          subheader={t("image.addsticker", {
            defaultValue: "Click/Tap to add sticker to photo",
          })}
        />
        <CardContent>
          {stickersData.map((sticker) => {
            return (
              <span
                onMouseDown={() => {
                  addStickerToPanel({
                    src: sticker.url,
                    width: sticker.width,
                    x: Math.floor(Math.random() * 550 + 20),
                    y: Math.floor(Math.random() * 300 + 20),
                  });
                }}
              >
                <img
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
          Looks good!
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={handlePublish}
          size="large"
        >
          Publish (debug)
        </Button>
      </div>
    </>
  );
};

const ImageOption = (props) => {
  const { image, setImage, setDraw } = props;
  const { t } = useTranslation();
  return (
    <Grid container spacing={24} justifyContent="space-between">
      <Grid item alignContent="stetch">
        {t("image.wanttoadd", { defaultValue: "Do you want to add a image?" })}
      </Grid>
      <Grid item>
        <ButtonGroup variant="contained" color="primary">
          <Button
            disableElevation={image}
            color={image === false ? "default" : "primary"}
            onClick={(e) => setDraw(true)}
          >
            {t("yes")}
          </Button>

          <Button
            variant="contained"
            onClick={(e) => setImage(false)}
            color={image ? "default" : "primary"}
          >
            {t("no")}
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};
