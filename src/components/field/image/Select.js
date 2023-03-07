import React, { useRef } from "react";
import { useCampaignConfig } from "@hooks/useConfig";
import { resize } from "@lib/image";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  thumb: {
    cursor: "pointer",
    display: "inline-block",
    maxWidth: "230px",
    maxHeight: "95px",
    width: "auto",
    height: "auto",
    marginRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

const PictureSelector = (props) => {
  const canvasRef = useRef();
  const classes = useStyles();
  const config = useCampaignConfig();
  const base = config.component.sticker?.baseUrl
    ? config.component.sticker.baseUrl + "/"
    : "";
  const handleClick = (e) => {
    const draw = (e) => {
      const img = e.target;
      const size = resize(img);
      const canvas = canvasRef.current;
      canvas.width = size.width;
      canvas.height = size.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size.width, size.height);
      if (props.setCanvas) {
        props.setCanvas(canvas);
      }
    };
    draw(e);
  };

  return (
    <>
      {config.component.sticker?.background?.map((d) => (
        <img
          src={base + d}
          crossorigin="anonymous"
          alt={d}
          onClick={handleClick}
          className={classes.thumb}
          key={d}
        />
      ))}
      <div>
        <canvas width={1} height={1} ref={canvasRef}></canvas>
      </div>
    </>
  );
};

export default PictureSelector;
