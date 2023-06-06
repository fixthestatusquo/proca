import React, { useState } from "react";
import { DropzoneArea } from "material-ui-dropzone";

const UploadFile = () => {
  const [message, setMessage] = useState();
  return (
    <>
      <div>{message}</div>
      <DropzoneArea
        fileLimit={1}
        acceptedFiles={["image/*"]}
        dropzoneText={"Drag and drop an image here or click"}
        onChange={(files) => {
          if (files.length === 0) return;
          setMessage("Message ready, press the send button below");
          console.log("Files:", files);
        }}
      />
    </>
  );
};

export default UploadFile;
