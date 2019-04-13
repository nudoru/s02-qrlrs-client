/* @jsx h */

import {h} from "../nori/Nori";
import {useEffect, useRef} from "../nori/Hooks";
import {css} from 'emotion';

const videoStream = css`
  width: 320px;
  height: 240px;
`;

/*
Handle resize?
v.addEventListener("resize", ev => {
  let w = v.videoWidth;
  let h = v.videoHeight;

  if (w && h) {
    v.style.width = w;
    v.style.height = h;
  }
}, false);
 */

const INTERVAL = (1000/10);

export const CanvasVideoSteam = props => {
  const FACING_MODE           = 'environment'; // use mobile rear camera
  const PLAY_INLINE           = true;
  let intervalID,
      canvasContext,
      mediaStream,
      videoEl                 = useRef(null),
      canvasEl                = useRef(null),
      {onFrameCallback, play} = props;

  if (play === undefined) {
    play = true;
  }

  useEffect(() => {
    canvasContext = canvasEl.getContext('2d');

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {facingMode: FACING_MODE}
    })
      .then(stream => {
        mediaStream = stream;
        videoEl.srcObject = mediaStream;
        videoEl.setAttribute("playsinline", PLAY_INLINE); // required to tell iOS safari we don't want fullscreen
        if (play) {
          let autoPlayPromise = videoEl.play();
          // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
          if (autoPlayPromise !== undefined) {
            autoPlayPromise.then(_ => {
              // Autoplay started!
            }).catch(error => {
              // Autoplay was prevented.
              // Show a "Play" button so that user can start playback.
            });
          }
        } else {
          videoEl.pause();
        }
        // intervalID = requestAnimationFrame(handleVideoFrame);
        intervalID = setTimeout(handleVideoFrame, INTERVAL);
      })
      .catch(err => {
        console.warn('VideoStream error :', err);
      });

    return () => {
      console.log('unloading video');
      //cancelAnimationFrame(intervalID);
      try {
        mediaStream.getTracks()[0].stop();
      } catch(e) {
        console.error(`CanvasVideoStream : Error stopping video track,`,e);
      }
      clearTimeout(intervalID);
    }
  }, []);

  const handleVideoFrame = _ => {
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA && play) {
      let vW = videoEl.videoWidth,
          vH = videoEl.videoHeight;

      canvasEl.width  = vW;
      canvasEl.height = vH;
      canvasContext.drawImage(videoEl, 0, 0, vW, vH);
      if (typeof onFrameCallback === 'function') {
        onFrameCallback(canvasEl, canvasContext);
      }
    } else if (!play) {
      //
    }
    // intervalID = requestAnimationFrame(handleVideoFrame);
    intervalID = setTimeout(handleVideoFrame, INTERVAL);
  };

  return (
    <div>
      <video className={videoStream} ref={el => videoEl = el} hidden/>
      <canvas className={videoStream} ref={el => canvasEl = el}/>
    </div>
  );
};