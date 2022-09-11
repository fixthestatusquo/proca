import React, { useState, useEffect } from "react";
import { Button, IconButton, Box } from "@material-ui/core";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import VideocamIcon from "@material-ui/icons/Videocam";
import CameraFrontIcon from "@material-ui/icons/CameraFront";
import CameraRearIcon from "@material-ui/icons/CameraRear";

const CameraField = (props) => {
  const [camera, switchCamera] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [dimension, setDimension] = useState({});
  const [picture, _takePicture] = useState(undefined);

  const width = 640,
    height = 480;

  const startCamera = async (facingMode) => {
    let video = document.querySelector("#video");
    let stream = null;
    let constraint = {
      audio: false,
      video: {
        width: width,
        height: height,
        facingMode: facingMode || "environment", // prefer the rear camera
      },
    };
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraint);
    } catch (err) {
      console.log("can't get camera", err);
      //what do do ?
      return;
    }
    const tracks = stream.getTracks();
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
      if (dim.vertical) {
        dim.ratioHeight = 0.3;
      } else {
        dim.ratioHeight = width / height / (dim.width / dim.height);
      }
      dim.ratioHeight = dim.ratioHeight * 100 + "%";
      setDimension(dim);
    };
    switchCamera(constraint.video.facingMode);
  };

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

    console.log("check permissions");
    if (cameras.length === 0) {
      checkPermissions();
    }
  }, []);

  const takePicture = () => {
    let video = document.querySelector("#video");
    let canvas = document.querySelector("#canvas");
    console.log(dimension);
    if (false && dimension.vertical) {
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(video, 0, 0, -canvas.width / 2, -canvas.height / 2);
      //      ctx.rotate(-Math.PI/2);
      //      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    } else {
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
      //      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    let image_data_url = canvas.toDataURL("image/jpeg");
    //_takePicture (image_data_url);
    _takePicture(image_data_url);
    // data url of the image
    console.log(image_data_url);
  };

  const switchCam = () => {
    startCamera(camera === "environment" ? "user" : "environment");
  };

  return (
    <>
      {!camera && (
        <Button
          fullWidth
          startIcon={<VideocamIcon />}
          variant="contained"
          color="primary"
          onClick={() => startCamera("environment")}
        >
          Start Camera
        </Button>
      )}
      <Box fullWidth style={{ maxWidth: "100%", cursor: "pointer" }}>
        <video
          hidden={!camera || picture}
          onClick={takePicture}
          id="video"
          width="100%"
          height="auto"
          autoPlay
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
          width={width}
          style={{ maxWidth: "100%" }}
          height={height}
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
    </>
  );
};

export default CameraField;
