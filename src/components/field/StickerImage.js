import React, { useState, createRef, useCallback } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import useImage from "use-image";
import { IndividualSticker } from "./image/IndividualStickers";
import { useCampaignConfig } from "@hooks/useConfig";

export default function App() {
  const config = useCampaignConfig();
  const [background] = useImage(
    config.component.sticker.baseUrl + "/" + config.component.sticker.picture
  );
  const [images, setImages] = useState([]);
  let stickersData = config.component.sticker.data;
  if (config.component.sticker.baseUrl) {
    stickersData = stickersData.map((image) =>
      Object.assign({}, image, {
        url: config.component.sticker.baseUrl + "/" + image.url,
      })
    );
  }
  console.log(stickersData);

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
  console.log(images);
  return (
    <div>
      <Stage
        width={600}
        height={400}
        onClick={handleCanvasClick}
        onTap={handleCanvasClick}
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
      <h4 className="heading">Click/Tap to add sticker to photo!</h4>
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
            <img alt={sticker.alt} src={sticker.url} width={sticker.width} />
          </span>
        );
      })}
    </div>
  );
}
