import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, IconButton, Box, LinearProgress, FormHelperText } from "@material-ui/core";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import VideocamIcon from "@material-ui/icons/Videocam";
import CameraFrontIcon from "@material-ui/icons/CameraFront";
import CameraRearIcon from "@material-ui/icons/CameraRear";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import { encode } from "blurhash";
import MaskImage from "@components/field/MaskImage";

export const useUpload = (canvasRef, formData = {}) => {
  const config = useCampaignConfig();
  const supabase = useSupabase();
  const { t } = useTranslation();

  //upload
  return async (params) => {
    const canvas = canvasRef && canvasRef.current && getCanvas(canvasRef);
    const toBlob = () => {
      return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 81));
    };

    const blob = await toBlob();
    const blobA = await blob.arrayBuffer();
    if (!crypto.subtle) {
      console.error ("needs to be on https");
    }
    const hashBuffer = await crypto.subtle.digest("SHA-256", blobA);
    const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
      .replace(/\+/g, "_")
      .replace(/\//g, "-")
      .replace(/=+$/g, "");
    console.log("hash", hash, getBlurhash(canvasRef));
    // hash = base64url of the sha256
    //    console.log(hash,encoder.encode(blob),blob);

    if (hash === params?.hash) {
      // already uploaded
      return true;
    }
    let d = {
      campaign: config.campaign.name,
      actionpage_id: config.actionPage,
      legend: "",
      width: canvas.width,
      height: canvas.height,
      hash: hash,
      blurhash: getBlurhash(canvasRef),
      lang: config.lang,
    };
    if (formData.country) d.area = formData.country;
    if (formData.firstname) {
      d.creator = formData.firstname.trim();
      if (formData.lastname) {
        d.creator += " " + formData.lastname.charAt(0).toUpperCase().trim();
      }
      if (d.locality) {
        d.creator = t("supporterHint", { name: d.creator, area: d.locality });
      }
      d.legend = d.creator;
    }

    //const f = items[current].original.split("/");
    const { error } = await supabase.from("pictures").insert(d);
    if (error && error.code !== "23505") {
      //error different than duplicated
      return error;
    }

    const r = await supabase.storage
      //.from(config.campaign.name.replaceAll("_", "-"))
      //.upload("public/" + hash + ".jpg", blob, {
      .from("picture")
      .upload(config.campaign.name + "/" + hash + ".jpg", blob, {
        cacheControl: "31536000",
        upsert: false,
      });
    if (r.error) {
      if (r.error.statusCode === "23505") {
        //duplicated
        return { hash: hash, width: canvas.width, height: canvas.height };
      }
      return r.error?.message || "error uploading file";
    }
    return { hash: hash, width: canvas.width, height: canvas.height };
  };
};

export const getCanvas = (canvasRef) => {
  if (canvasRef.current.bufferCanvas) {
    // Konva, remove some drawing
    return canvasRef.current.toCanvas();
  }
  return canvasRef.current;
};
export const getBlurhash = (canvasRef) => {
  const canvas = getCanvas(canvasRef);
  const blurHash = encode(
    canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
      .data,
    canvas.width,
    canvas.height,
    3,
    4
  );
  return blurHash;
};

const CameraField = (props) => {
  const [camera, switchCamera] = useState(false);
  const [isValidating, validating] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [dimension, setDimension] = useState({});
  const [picture, _takePicture] = useState(undefined);
  const max_size = 640;
  const [cDim, _setcDim] = useState({ width: max_size, height: max_size }); // it will be adjusted based on the camera
  const canvasRef = useRef();
  const videoRef = useRef();
  const config = useCampaignConfig();
  const { t } = useTranslation();
  const upload = useUpload(canvasRef, max_size);

  const { 
    formState: { errors },
 getValues, register, setError, setValue } = props.form
    ? props.form
    : {formState:{errors:{}}};

  const setcDim = (dim) => {
    let { width, height } = dim;
    if (width > height) {
      if (width > max_size) {
        height *= max_size / width;
        width = max_size;
      }
    } else {
      if (height > max_size) {
        width *= max_size / height;
        height = max_size;
      }
    }
    _setcDim({ width: dim.width, height: dim.height });
  };
  const startCamera = useCallback(
    async (facingMode) => {
      let video = videoRef.current;
      video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      let stream = null;
      let constraint = {
        audio: false,
        video: {
          width: 640,
          height: 360,
          facingMode: facingMode || "user", // prefer the rear camera
//          facingMode: facingMode || "environment", // prefer the rear camera
        },
      };
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
      } catch (err) {
        setError("image", {
          type: "js",
          message: "camera error, check your permissions\n [" + err.toString() +"[]",
        });
        console.log("can't get camera", err);
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((d) => ({ id: d.deviceId, name: d.label }));
      setCameras(videoDevices);
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        let dim = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        setcDim(dim);
        setDimension(dim);
      };
      switchCamera(constraint.video.facingMode);
    },
    [setError]
  );

  useEffect(() => {
    // declare the data fetching function
    const checkPermissions = async () => {
      try {
        const allowed = await navigator.permissions.query({ name: "camera" });
        console.log("allowed", allowed);
        if (allowed.state === "granted") {
          startCamera("environment");
        }
      } catch (e) {
        // firefox doesn't allow camera permission to be checked
      }
    };

    if (cameras.length === 0) {
      checkPermissions();
    }
  }, [cameras.length, startCamera]);

  const takePicture = async () => {
    let video = videoRef.current;
    let canvas = canvasRef.current;
    canvas
      .getContext("2d")
      .drawImage(
        video,
        0,
        0,
        dimension.width,
        dimension.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

    let image_data_url = canvas.toDataURL("image/jpeg");

    _takePicture(image_data_url);
    if (props.setCanvas) props.setCanvas(canvas);
    // data url of the image
  };

  const switchCam = () => {
    startCamera(camera === "environment" ? "user" : "environment");
  };

  const validateImage = async () => {
    //    const delay = ms => new Promise(res => setTimeout(res, ms));
    //await delay (1500);
    if (!camera) return "Start the camera and take a picture";
    if (!picture) {
      await takePicture();
      //if (!picture) return "Take a picture";
    }
    validating(true);
    const r = await upload({ hash: getValues("hash") });
    if (r.message) {
      return r.message;
    }
    setValue("hash", r.hash);
    setValue("imageId", r.id);
    setValue("blurhash", getBlurhash(canvasRef));
    setValue(
      "image",
      process.env.REACT_APP_SUPABASE_URL +
        "/storage/v1/object/public/" +
        config.campaign.name.replaceAll("_", "-") +
        "/public/" +
        r.hash +
        ".jpg"
    );
    validating(false);
    return true;
  };

console.log(errors);
  return (
    <>
      {register && (
        <>
          <input
            type="hidden"
            {...register("image", { validate: validateImage })}
          />
          <input type="hidden" {...register("hash")} />
          <input type="hidden" {...register("imageId")} />
        </>
      )}
      {!camera && (<>
        <Button
          fullWidth
          startIcon={<VideocamIcon />}
          variant="contained"
          color="primary"
          onClick={() => startCamera("environment")}
        >
          {t("camera.start", "start the camera")}
        </Button>
        </>
      )}
      <Box
        fullWidth
        style={{ position: "relative", maxWidth: "100%", cursor: "pointer" }}
      >
        <video
          hidden={!camera || picture}
          onClick={takePicture}
          id="video"
          ref={videoRef}
          width="100%"
          height="auto"
          autoPlay
          playsInline
          muted
        ></video>
        {camera && !picture && (
          <Box display="flex">
            <Box flexGrow={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={takePicture}
                color="primary"
                startIcon={<PhotoCameraIcon />}
              >
                {t("camera.take", "Take picture")}
              </Button>
            </Box>
            <Box>
              {cameras.length > 1 && (
                <IconButton
                  aria-label="switch camera front-back"
                  onClick={switchCam}
                >
                  {camera === "user" ? <CameraRearIcon /> : <CameraFrontIcon />}
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>
      <Box
        hidden={!picture}
        fullWidth
        style={{ maxWidth: "100%", cursor: "pointer", position: "relative" }}
        onClick={takePicture}
      >
        {config.component.camera?.mask && <MaskImage />}
        <canvas
          id="canvas"
          ref={canvasRef}
          width={cDim.width}
          style={{ maxWidth: "100%" }}
          height={cDim.height}
        ></canvas>
        {isValidating && <LinearProgress fullWidth />}
      </Box>
      {picture && (
        <Box>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PhotoCameraIcon />}
            onClick={() => _takePicture(undefined)}
          >
            {t("camera.take-another", "Take another one")}
          </Button>
        </Box>
      )}
      <div>
        <FormHelperText error={!!(errors && errors.image)}>
          {errors && errors.image && errors.image.message}
        </FormHelperText>
      </div>
    </>
  );
};

export default CameraField;
