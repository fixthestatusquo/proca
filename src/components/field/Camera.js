import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, IconButton, Box } from "@material-ui/core";
import { FormHelperText } from "@material-ui/core";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import VideocamIcon from "@material-ui/icons/Videocam";
import CameraFrontIcon from "@material-ui/icons/CameraFront";
import CameraRearIcon from "@material-ui/icons/CameraRear";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";

const CameraField = (props) => {
  const [camera, switchCamera] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [dimension, setDimension] = useState({});
  const [picture, _takePicture] = useState(undefined);
  const [cDim, setcDim] = useState({ width: 480 * 2, height: 640 * 2 });
  const canvasRef = useRef();
  const videoRef = useRef();
  const config = useCampaignConfig();
  const supabase = useSupabase();
  const { t } = useTranslation();
  const { errors, getValues, register, setError, setValue } = props.form;
  const upload = async (params) => {
    const toBlob = () =>
      new Promise((resolve) => {
        canvasRef.current.toBlob(resolve, "image/jpeg", 81);
      });

    const blob = await toBlob();
    const blobA = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", blobA);
    const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
      .replace(/\+/g, "_")
      .replace(/\//g, "-")
      .replace(/=+$/g, "");
    // hash = base64url of the sha256
    //    console.log(hash,encoder.encode(blob),blob);

    if (hash === params.hash) {
      // already uploaded
      return true;
    }
    let d = {
      campaign: config.campaign.name,
      actionpage_id: config.actionPage,
      legend: "",
      width: canvasRef.current.width,
      height: canvasRef.current.height,
      hash: hash,
      lang: config.lang,
    };
    //const f = items[current].original.split("/");
    const { data, error } = await supabase.from("pictures").insert([d]);
    if (error && error.statusCode !== "23505") {
      //error different than duplicated
      return error;
    }
    const r = await supabase.storage
      .from(config.campaign.name.replaceAll("_", "-"))
      .upload("public/" + hash + ".jpg", blob, {
        cacheControl: "31536000",
        upsert: false,
      });
    if (r.error) {
      if (r.error.statusCode === "23505") {
        //duplicated
        return { id: data[0].id, hash: hash };
      }
      console.log(r.error);
      if (r.error) return r.error;
    }
    return { id: data[0].id, hash: hash };
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
          //        width: cDim.width,
          //        height: cDim.height,
          facingMode: facingMode || "environment", // prefer the rear camera
        },
      };
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
      } catch (err) {
        setError("image", {
          type: "js",
          message: "camera error, check your permissions\n" + err.toString(),
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
        dim.vertical = dim.width < dim.height;
        if (!dim.vertical) setcDim(dim);
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
    // data url of the image
  };

  const switchCam = () => {
    startCamera(camera === "environment" ? "user" : "environment");
  };

  const validateImage = async (image) => {
    if (!camera) return "Start the camera and take a picture";
    if (!picture) return "Take a picture";
    const r = await upload({ hash: getValues("hash") });
    if (r.message) {
      return r.message;
    }
    setValue("hash", r.hash);
    setValue("imageId", r.id);
    setValue(
      "image",
      process.env.REACT_APP_SUPABASE_URL +
        "/storage/v1/object/public/" +
        config.campaign.name.replaceAll("_", "-") +
        "/public/" +
        r.hash +
        ".jpg"
    );
    return true;
  };

  return (
    <>
      <input
        type="hidden"
        {...register("image", { validate: validateImage })}
      />
      <input type="hidden" {...register("hash")} />
      <input type="hidden" {...register("imageId")} />
      {!camera && (
        <Button
          fullWidth
          startIcon={<VideocamIcon />}
          variant="contained"
          color="primary"
          onClick={() => startCamera("environment")}
        >
          {t("camera.start", "start the camera")}
        </Button>
      )}
      <Box fullWidth style={{ maxWidth: "100%", cursor: "pointer" }}>
        <video
          hidden={!camera || picture}
          onClick={takePicture}
          id="video"
          ref={videoRef}
          width="100%"
          height="auto"
          autoPlay
          playinline
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
                Take picture
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
        style={{ maxWidth: "100%", cursor: "pointer" }}
        onClick={takePicture}
      >
        <canvas
          id="canvas"
          ref={canvasRef}
          width={cDim.width}
          style={{ maxWidth: "100%" }}
          height={cDim.height}
        ></canvas>
      </Box>
      {picture && (
        <>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PhotoCameraIcon />}
            onClick={() => _takePicture(undefined)}
          >
            Take another one
          </Button>
        </>
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
