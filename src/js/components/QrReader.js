/* @jsx h */


import {h} from "../nori/Nori";
import _ from "lodash";
import {useState} from "../nori/Hooks";
import {CanvasVideoSteam} from "./CanvasVideoStream";
import {drawPoly} from "../nori/util/CanvasUtils";
import jsQR from "jsqr";

/*
// Source from https://cozmo.github.io/jsQR/
// https://github.com/cozmo/jsQR
*/

const INTERVAL = 100;

export const QrReader = props => {

  let {onErrorCallback, onReadCallback, ...restProps} = props;

  const getCodeFromCanvasFrame = (canvasContext, canvasEl) => {
    let imageData = canvasContext.getImageData(0, 0, canvasEl.width, canvasEl.height);
    let code      = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    return code ? code : null;
  };

  const processVideoFrame = (canvasEl, canvasContext) => {
    const data = getCodeFromCanvasFrame(canvasContext, canvasEl);
    if (data) {
      drawPoly(canvasContext, data.location);
      try {
        let json = JSON.parse(data.data);
        console.log(`Read data from code:`, json);
        if (typeof onReadCallback === 'function') {
          onReadCallback(json);
        }
      } catch (err) {
        console.warn(`Couldn't parse code to JSON : `, data.data);
        if (typeof onErrorCallback === 'function') {
          onErrorCallback(err, data.data);
        }
      }
    }
  };

  return (<CanvasVideoSteam
    onFrameCallback={_.throttle(processVideoFrame, INTERVAL)}/>)
};