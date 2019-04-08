/* @jsx h */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";
import {css} from 'emotion';
import jsQR from 'jsqr';

/*
// Source from https://cozmo.github.io/jsQR/
// https://github.com/cozmo/jsQR
*/

const initializeMediaStream = (videoObj, tickFn) => {
  // Use facingMode: environment to attempt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
    videoObj.srcObject = stream;
    videoObj.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    videoObj.play();
    requestAnimationFrame(tickFn);
  });
};

const getCodeFromCanvasFrame = (canvasObj, canvasEl) => {
  let imageData = canvasObj.getImageData(0, 0, canvasEl.width, canvasEl.height);
  let code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });

  return code ? code : null;
};

const outlineCodeInFrame = (canvasObj, code) => {
  const OUTLINE_COLOR = `#FF3B58`;
  drawLine(canvasObj, code.location.topLeftCorner, code.location.topRightCorner, OUTLINE_COLOR);
  drawLine(canvasObj, code.location.topRightCorner, code.location.bottomRightCorner, OUTLINE_COLOR);
  drawLine(canvasObj, code.location.bottomRightCorner, code.location.bottomLeftCorner, OUTLINE_COLOR);
  drawLine(canvasObj, code.location.bottomLeftCorner, code.location.topLeftCorner, OUTLINE_COLOR);
};

const drawLine = (canvasEl, begin, end, color) => {
  canvasEl.beginPath();
  canvasEl.moveTo(begin.x, begin.y);
  canvasEl.lineTo(end.x, end.y);
  canvasEl.lineWidth = 4;
  canvasEl.strokeStyle = color;
  canvasEl.stroke();
};

export default class QrReader extends NoriComponent {

  constructor(props) {
    super(props);
    this.state = {code:null};
  }

  componentDidMount = () => {
    this.video = document.createElement("video");
    this.canvasElement = document.getElementById("canvas");
    this.canvas = this.canvasElement.getContext("2d");
    this.loadingMessage = document.getElementById("loadingMessage");
    this.outputData = document.getElementById("outputData");

    initializeMediaStream(this.video, this.handleVideoFrame);
  };

  handleVideoFrame = _ => {
    this.loadingMessage.innerText = "Starting video...";
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.loadingMessage.hidden = true;
      this.canvasElement.hidden = false;
      this.canvasElement.height = this.video.videoHeight;
      this.canvasElement.width = this.video.videoWidth;
      this.canvas.drawImage(this.video, 0, 0, this.canvasElement.width, this.canvasElement.height);

      const data = getCodeFromCanvasFrame(this.canvas, this.canvasElement);

      if(data) {
        outlineCodeInFrame(this.canvas, data);
        this.state ={code: data.data};
      }

    }
    requestAnimationFrame(this.handleVideoFrame);
  };



  render() {
    return (<div>
      <div id="loadingMessage">Unable to access device video.</div>
      <canvas id="canvas"/>
      <div id="output">
        <h1 id="outputData">{this.state.code}</h1>
      </div>
    </div>)
  }
}