import React, { useRef } from "react";
import { Button } from "@material-ui/core";

export default function UploadPicture(props) {
  const canvasRef = useRef();
  const uploadImage = (e) => {
    const resize = (img) => {
      const max_size = 640;
      let width = max_size;
      let height = max_size;
      const isPortrait = img.height > img.width;
      if (isPortrait) {
        width = (max_size / img.height) * img.width;
      } else {
        height = (max_size / img.width) * img.height;
      }
      return { width: width, height: height };
    };
    const draw = (e) => {
      const img = e.target;
      let canvas = canvasRef.current;
      const size = resize(img);
      canvas.width = size.width;
      canvas.height = size.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size.width, size.height);
      if (props.uploadedCanvas) {
        props.uploadedCanvas(canvas);
      }
    };

    var img = new Image();
    img.onload = draw;
    //  img.onerror = failed;
    img.src = URL.createObjectURL(e.target.files[0]);
  };

  return (
    <div>
      <div>
        <Button variant="contained" color="primary" fullWidth component="label">
          Upload
          <input
            hidden
            accept="image/*"
            onChange={(e) => uploadImage(e)}
            type="file"
          />
        </Button>
      </div>
      <div>
        <canvas height={1} ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
