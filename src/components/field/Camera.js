import React, { useState } from "react";
import { Button } from "@material-ui/core";

const CameraField = (props) => {
  const [camera, switchCamera] = useState(false);
  const [picture, _takePicture] = useState(undefined);

  console.log(camera, picture);
  const startCamera = async () => {
    console.log("start");
    let video = document.querySelector("#video");
    let stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    video.srcObject = stream;
    switchCamera(true);
  };

  const takePicture = () => {
    console.log("take Picture");
    let video = document.querySelector("#video");
    let canvas = document.querySelector("#canvas");
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL("image/jpeg");
    //_takePicture (image_data_url);
    _takePicture(image_data_url);
    // data url of the image
    console.log(image_data_url);
  };
  return (
    <>
      {!camera && (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          aonClick={() => console.log("click")}
          onClick={startCamera}
        >
          Start Camera
        </Button>
      )}
      <video
        hidden={!camera || picture}
        id="video"
        width="320"
        height="240"
        autoPlay
      ></video>
      {camera && !picture && (
        <>
          <Button
            fullWidth
            variant="contained"
            onClick={takePicture}
            color="primary"
          >
            Click Photo
          </Button>
        </>
      )}
      <canvas hidden={!picture} id="canvas" width="320" height="240"></canvas>
      {picture && (
        <>
          <Button
            fullWidth
            variant="contained"
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
