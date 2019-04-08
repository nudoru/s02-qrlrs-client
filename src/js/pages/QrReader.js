/* @jsx h */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";
import {css} from 'emotion';
import jsQR from 'jsqr';

/*
// Source from https://cozmo.github.io/jsQR/
var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var outputContainer = document.getElementById("output");
var outputMessage = document.getElementById("outputMessage");
var outputData = document.getElementById("outputData");
*/

export default class QrReader extends NoriComponent {

  // Subclasses should only take passed props and children
  constructor(props) {
    super(props);
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
        this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
        this.outputMessage.hidden = true;
        this.outputData.parentElement.hidden = false;
        this.outputData.innerText = code.data;
      } else {
        this.outputMessage.hidden = false;
        this.outputData.parentElement.hidden = true;
      }
    }
    requestAnimationFrame(this.tick);
  };

  componentWillUnmount = () => {
    //console.log('Greet will remove');
  };

  componentWillUpdate = () => {
    //console.log('Greet will update', this.state.name);
  };

  componentDidUpdate = () => {
    // console.log('Greet did update');
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