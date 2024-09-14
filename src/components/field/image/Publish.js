import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, IconButton, Box, LinearProgress, FormHelperText } from "@material-ui/core";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import VideocamIcon from "@material-ui/icons/Videocam";
import CameraFrontIcon from "@material-ui/icons/CameraFront";
import CameraRearIcon from "@material-ui/icons/CameraRear";
import { useSupabase } from "@lib/supabase";
import { useCampaignConfig } from "@hooks/useConfig";
import { useTranslation } from "react-i18next";
import { rgbaToThumbHash } from 'thumbhash';
import { resize } from "@lib/image";
import { binaryToBase64 } from "@lib/hash";

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
      return { hash: "http_development", width: canvas.width, height: canvas.height, error: "crypto_missing" };
    }
    const hashBuffer = await crypto.subtle.digest("SHA-256", blobA);
    const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
      .replace(/\+/g, "_")
      .replace(/\//g, "-")
      .replace(/=+$/g, "");
    // hash = base64url of the sha256
    //    console.log(hash,encoder.encode(blob),blob);

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
    const result = { hash: hash, width: canvas.width, height: canvas.height };
    const { error } = await supabase.from("pictures").insert(d);
    if (error) { 
      if ( error.code === "23505") {
        console.warn("image already uploaded");
        result.error = error.toString();
        // return result; // continue and try to upload the picture anyway, it might have failed previously
      } else {
        //error different than duplicated
        console.error (error);
        result.error = error?.message || error;
        return result;
      }
    }

    const r = await supabase.storage
      //.from(config.campaign.name.replaceAll("_", "-")) seems that "_" works fine as bucket's name
      .from(config.campaign.name)
      .upload("public/" + hash + ".jpg", blob, {
      //.from("picture")
      //.upload(config.campaign.name + "/" + hash + ".jpg", blob, {
        cacheControl: "31536000",
        upsert: false,
      });
    if (r.error) {
      if (r.error.statusCode === "23505") {
        //duplicated
        return result;
      }
      console.log(r.error);
      result.error = r.error?.message ||"error uploading file";
      return result;
    }
    return result;
  };
};

export const getCanvas = (canvasRef) => {
  if (canvasRef.current.bufferCanvas) {
    return canvasRef.current.toCanvas();
  }
  return canvasRef.current;
};

export const resizedCanvas = (canvas) => {
  const size = resize (canvas, 100);
  const resizedCanvas = document.createElement('canvas');
  const ctx = resizedCanvas.getContext('2d');
  resizedCanvas.width = size.width;
  resizedCanvas.height = size.height;
  ctx.drawImage(canvas, 0, 0, size.width, size.height);  
  return resizedCanvas;
    
}

export const getBlurhash = (canvasRef) => {
  const original = getCanvas(canvasRef);
  const canvas = resizedCanvas (original);
  const thumbhash = rgbaToThumbHash(canvas.width, canvas.height, canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
      .data);
  const blurhash = binaryToBase64(thumbhash);
  return blurhash;
};

