import useImage from "use-image";
import React, { useState, useEffect, useRef } from "react";
import { Circle, Image as KonvaImage, Group } from "react-konva";
import { useHoverDirty, useLongPress } from "react-use";

import { resize } from "@lib/image";

export const IndividualSticker = ({ image, onDelete, onDragEnd }) => {
  const imageRef = useRef(null);
  const isHovered = useHoverDirty(imageRef);
  const [stickerImage] = useImage(image.src, "anonymous", "origin");

  const svgstring = `<svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      color="#ee5139"
      d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
    ></path>
  </svg>`;
  const deleteImage = new Image();
  deleteImage.src =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgstring);

  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [size, setSize] = useState(undefined);
  const onLongPress = () => {
    setShowDeleteButton(true);
  };

  const longPressEvent = useLongPress(onLongPress, { delay: 200 });
  useEffect(() => {
    if (isHovered) {
      setShowDeleteButton(true);
    } else {
      setTimeout(() => {
        setShowDeleteButton(false);
      }, 2000);
    }
  }, [isHovered]);

  useEffect(() => {
    if (size || !stickerImage) return;
    //need resize?
    const nsize = resize(stickerImage, image.width);
    setSize({ width: nsize.width, height: nsize.height });
  }, [size, setSize, stickerImage, image.width]);

  image.resetButtonRef.current = () => {
    setShowDeleteButton(false);
  };
  const [isDragging, setIsDragging] = useState(false);
  const [draggable, setDraggable] = useState(true);
  if (!stickerImage || !size) return null; // we need to wait until the image is loaded
  //  const stickerWidth = image.width;
  //  const stickerHeight = stickerImage
  //    ? (image.width * stickerImage.height) / stickerImage.width
  //    : 0;
  // resize height but not width?

  const update = (activeAnchor) => {
    const group = activeAnchor.getParent();
    const anchorX = activeAnchor.x();
    const anchorY = activeAnchor.y();
    const img = group.findOne("Image");
    const width = Math.abs(anchorX);
    const height = Math.abs(anchorY);
    if (width && height) {
      img.width(width);
      img.height(height);
    }
  };

  return (
    <Group
      draggable={draggable}
      x={image.x}
      y={image.y}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event) => {
        setIsDragging(false);
        onDragEnd(event);
      }}
    >
      <KonvaImage
        ref={imageRef}
        width={size.width}
        height={size.height}
        image={stickerImage}
        onMouseOver={function () {
          document.body.style.cursor = "grab";
        }}
        onMouseOut={function () {
          document.body.style.cursor = "default";
        }}
        {...longPressEvent}
      />
      <Circle
        x={size.width}
        y={size.height}
        aoffsetX={-size.width}
        aoffsetY={-size.height}
        stroke="#666"
        fill="#ddd"
        strokeWidth={2}
        radius={8}
        name="resize"
        draggable={true}
        dragOnTop={false}
        onMouseDown={function () {
          setDraggable(false);
          this.moveToTop();
        }}
        {...longPressEvent}
        onDragMove={function () {
          update(this);
        }}
        onDragEnd={(e) => {
          const group = e.target.getParent();
          const img = group.findOne("Image");
          setSize({ width: img.width(), height: img.height() });
          setDraggable(true);
          e.cancelBubble = true;
        }}
        // add hover styling
        onMouseOver={function (e) {
          // can't be arrow function for this to work
          document.body.style.cursor = "nwse-resize";
          this.strokeWidth(4);
        }}
        onMouseOut={function (e) {
          document.body.style.cursor = "default";
          this.strokeWidth(2);
        }}
      />
      {showDeleteButton && !isDragging && (
        <KonvaImage
          onTouchStart={onDelete}
          onClick={onDelete}
          image={deleteImage}
          name="delete"
          width={25}
          height={25}
          offsetX={-size.width + 20}
        />
      )}
    </Group>
  );
};
