/* @jsx h */


import {h} from "../nori/Nori";
import _ from "lodash";
import {useState} from "../nori/Hooks";
import {VideoSteam} from "./VideoStream";
import {drawPoly} from "../nori/util/CanvasUtils";
import jsQR from "jsqr";

/*
// Source from https://cozmo.github.io/jsQR/
// https://github.com/cozmo/jsQR
*/

export const QrReader = props => {

  let [data, setData]                   = useState({code: null}),
      hasData                           = data.code !== null ? true : false,
      {onErrorCallback, onReadCallback} = props;

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
        //setData({code: json});
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

  return (<div>
    {() => {
      if (hasData) {
        return <p>{JSON.stringify(data.code)}</p>
      } else {
        return <VideoSteam
          onFrameCallback={_.throttle(processVideoFrame, 10)}/>
      }
    }
    }
  </div>)
};