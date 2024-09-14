import React, { useState, useRef, createRef, useCallback } from "react";

import { scrollTo } from "@lib/scroll";

import useImage from "use-image";
import Camera from "./Camera";
import { useUpload } from "@components/field/image/Publish";
import Hidden from "./Hidden";
import UploadPicture from "./image/Upload";
import SelectPicture from "./image/Select";
import ImageIcon from "@material-ui/icons/Image";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import { useCampaignConfig } from "@hooks/useConfig";
import { resize } from "@lib/image";

import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  ButtonGroup,
  Collapse,
  DialogActions,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Dialog from "@components/Dialog";
import { useTranslation } from "react-i18next";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  accordion: {
    display: "block!important",
  },
  buttonGroup: {
    marginRight: theme.spacing(1),
  },
  dialog: {
    minWidth: theme.breakpoints.values.sm,
  },
}));

export default function Picture(props) {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const classes = useStyles();
  const [draw, setDraw] = useState(false);
  const [image, setImage] = useState(undefined);
  const [canvas, setCanvas] = useState(undefined);
  const [activeStep, setActiveStep] = useState(0);

  //  const data = props.form?.getValues();
  const handleClose = () => {
    setDraw(false);
    scrollTo({ delay: 300, selector: "#proca-image" });
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const uploadedCanvas = (canvas) => {
    setCanvas(canvas);
    setActiveStep(1);
  };

  const DialogAction = () => (
  <DialogActions>
    <PublishPicture {...props} canvas={canvas} setImage={setImage} setDraw={setDraw} />
  </DialogActions>
  )

  return (
    <div>
      <Hidden name="hash" form={props.form}/>
      <Hidden name="dimension" form={props.form} />
      <ImageOption image={image} setImage={setImage} setDraw={setDraw} />
      <Dialog
        name={config.campaign.title}
        maxWidth="lg"
        dialog={draw !== false}
        close={handleClose}
        hideBackdrop
        Action={DialogAction}
      >
        {config.component.picture?.upload !== false && (
          <PictureAccordion uploadedCanvas={uploadedCanvas} form={props.form}/>
        )}
        {config.component.picture?.upload === false && (
          <SelectPicture setCanvas={uploadedCanvas} form={props.form} />
        )}
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

const PictureAccordion = ({ uploadedCanvas, form }) => {
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <>
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
          <Camera setCanvas={uploadedCanvas} form={form} />
        </AccordionDetails>
      </Accordion>
      {config.component.picture?.library !== false && (
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
      )}
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


const PublishPicture = (props) => {
  const { t } = useTranslation();
  const config = useCampaignConfig();
  const {setValue } = props.form;
  const canvasRef = useRef(props.canvas);
  const data = props.form?.getValues();
  const upload = useUpload(canvasRef, data);

  const handleSave = async (close) => {
    if (!close) close = true;
    const r = await upload();
    console.log("uploaded", r);
    //    r.hash;
    setValue("hash", r.hash);
    setValue("dimension", "[" + r.width + "," + r.height + "]");

    props.setImage(props.canvas.toDataURL("image/jpeg", 0.8));
    //    console.log(canvasRef.current.toDataUrl("jpeg",81));
    props.setDraw(!close);
  };

  return (
  <div>
    <Button
      variant="contained"
      color="primary"
      onClick={handleSave}
      disabled ={!props.canvas}
      size="large"
    >
      {t("image.publish", "Looks good, publish!")}
    </Button>
    {config.test && (
      <Button
        variant="contained"
        color="secondary"
        disabled ={!props.canvas}
        onClick={() => handleSave(false)}
        size="large"
      >
        Publish (debug)
      </Button>
    )}
  </div>);
};
