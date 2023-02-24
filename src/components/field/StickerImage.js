import React, { useState, useRef, createRef, useCallback } from "react";
import {
  Image as KonvaImage,
  Layer,
  Stage,
} from "react-konva/lib/ReactKonvaCore";
import useImage from "use-image";
import { useUpload } from "./Camera";
import { IndividualSticker } from "./image/IndividualStickers";
import { useCampaignConfig } from "@hooks/useConfig";
import {
  Button,
  ButtonGroup,
  CardContent,
  Card,
  CardHeader,
} from "@material-ui/core";
import Dialog from "@components/Dialog";

export default function ImageStickerComplete(props) {
  const [draw, setDraw] = useState(false);
  const [image, setImage] = useState(undefined);
  const handleClose = () => setDraw(false);

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
        <ImageStickerKonva setImage={setImage} setDraw={setDraw} />
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

  const [background] = useImage(
    config.component.sticker.baseUrl + "/" + config.component.sticker.picture,
    "anonymous",
    "origin"
  );
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
          <KonvaImage
            image={background}
            height={400}
            width={600}
            id="backgroundImage"
          />
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
        <CardHeader subheader="Click/Tap to add sticker to photo" />
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
  return (
    <>
      Do you want to add a image?
      <ButtonGroup variant="contained" color="primary">
        <Button
          disableElevation={image}
          color={image === false ? "default" : "primary"}
          onClick={(e) => setDraw(true)}
        >
          yes
        </Button>

        <Button
          variant="contained"
          onClick={(e) => setImage(false)}
          color={image ? "default" : "primary"}
        >
          no
        </Button>
      </ButtonGroup>
    </>
  );
};
