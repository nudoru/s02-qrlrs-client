/* @jsx h */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";
import {useEffect, useRef} from "../nori/Hooks";
import {VideoSteam} from "../components/VideoStream";
import {drawPoly} from "../nori/util/CanvasUtils";
import jsQR from 'jsqr';
import _ from 'lodash';

/*
// Source from https://cozmo.github.io/jsQR/
// https://github.com/cozmo/jsQR
*/

export default class QrReader extends NoriComponent {
  constructor(props) {
    super(props);
    // todo useState
    this.state = {code: null};
  }

  componentDidMount = () => {
  };

  getCodeFromCanvasFrame = (canvasContext, canvasEl) => {
    let imageData = canvasContext.getImageData(0, 0, canvasEl.width, canvasEl.height);
    let code      = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    return code ? code : null;
  };

  processVideoFrame = (canvasEl, canvasContext) => {
    const data = this.getCodeFromCanvasFrame(canvasContext, canvasEl);
    if (data) {
      drawPoly(canvasContext, data.location);
      this.state = {code: data};
    }
  };

  render() {
    let data = this.state.code !== null && this.state.code.hasOwnProperty('data') ? this.state.code.data : '';
    return (<div>
      <VideoSteam onFrameCallback={_.throttle(this.processVideoFrame, 20)}/>
      <div id="output">
        <h1 id="outputData">{data}</h1>
      </div>
    </div>)
  }
}