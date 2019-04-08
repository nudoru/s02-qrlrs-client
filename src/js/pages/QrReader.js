/* @jsx h */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";
import {css} from 'emotion';
import jsQR from 'jsqr';

/*
// Source from https://cozmo.github.io/jsQR/
// https://github.com/cozmo/jsQR
*/

const OUTLINE_COLOR = `#FF3B58`;

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
    this.outputContainer = document.getElementById("output");
    this.outputMessage = document.getElementById("outputMessage");
    this.outputData = document.getElementById("outputData");

    // Use facingMode: environment to attempt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
      this.video.srcObject = stream;
      this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      this.video.play();
      requestAnimationFrame(this.tick);
    });
  };

  drawLine = (begin, end, color) => {
    this.canvas.beginPath();
    this.canvas.moveTo(begin.x, begin.y);
    this.canvas.lineTo(end.x, end.y);
    this.canvas.lineWidth = 4;
    this.canvas.strokeStyle = color;
    this.canvas.stroke();
  };

  tick = _ => {
    this.loadingMessage.innerText = "⌛ Loading video...";
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.loadingMessage.hidden = true;
      this.canvasElement.hidden = false;
      this.outputContainer.hidden = false;

      this.canvasElement.height = this.video.videoHeight;
      this.canvasElement.width = this.video.videoWidth;
      this.canvas.drawImage(this.video, 0, 0, this.canvasElement.width, this.canvasElement.height);

      let imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, OUTLINE_COLOR);
        this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, OUTLINE_COLOR);
        this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, OUTLINE_COLOR);
        this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, OUTLINE_COLOR);
        this.outputMessage.hidden = true;
        this.outputData.parentElement.hidden = false;
        this.outputData.innerText = code.data;
        console.log(code);
        this.state ={code: code.data};
      } else {
        this.outputMessage.hidden = false;
        this.outputData.parentElement.hidden = true;
      }
    }
    requestAnimationFrame(this.tick);
  };

  render() {
    return (<div>
      <div id="loadingMessage">🎥 Unable to access video stream (please make
        sure you have a webcam enabled)
      </div>
      <canvas id="canvas" hidden/>
      <div id="output" hidden>
        <div id="outputMessage">No QR code detected.</div>
        <div hidden><b>Data:</b> <span id="outputData"></span></div>
      </div>
    </div>)
  }
}