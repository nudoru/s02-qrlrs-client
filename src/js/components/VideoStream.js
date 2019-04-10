/* @jsx h */

import {h} from "../nori/Nori";
import {useEffect, useRef} from "../nori/Hooks";

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

export const VideoSteam = props => {
  const FACING_MODE     = 'environment'; // use mobile rear camera
  const PLAY_INLINE     = true;
  let loopVideo         = true,
      currentAnimationRequestId,
      canvasContext,
      videoEl           = useRef(null),
      canvasEl          = useRef(null),
      lastFrame,
      {onFrameCallback, play} = props;

  if(play === undefined) {
    play = true;
  }

  useEffect(() => {
    canvasContext = canvasEl.current.getContext('2d');

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {facingMode: FACING_MODE}
    })
      .then(stream => {
        videoEl.current.srcObject = stream;
        videoEl.current.setAttribute("playsinline", PLAY_INLINE); // required to tell iOS safari we don't want fullscreen
        if(play) {
          let autoPlayPromise = videoEl.current.play();
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
          videoEl.current.pause();
        }

        currentAnimationRequestId = requestAnimationFrame(handleVideoFrame);
      })
      .catch(err => {
        console.warn('VideoStream error :', err);
      });

    return () => {
      //loopVideo = false;
      //videoEl.current.pause();
      cancelAnimationFrame(currentAnimationRequestId);
      lastFrame = null;
    }
  }, []);

  const handleVideoFrame = _ => {
    if (videoEl.current.readyState === videoEl.current.HAVE_ENOUGH_DATA && play) {
      let vW = videoEl.current.videoWidth,
          vH = videoEl.current.videoHeight;

      canvasEl.current.width  = vW;
      canvasEl.current.height = vH;
      lastFrame = videoEl.current;
      canvasContext.drawImage(lastFrame, 0, 0, vW, vH);
      if (typeof onFrameCallback === 'function') {
        onFrameCallback(canvasEl.current, canvasContext);
      }
    } else if(!play) {
      //
    }
    if (loopVideo) {
      currentAnimationRequestId = requestAnimationFrame(handleVideoFrame);
    }
  };

  return (
    <div>
      <video ref={videoEl} hidden/>
      <canvas ref={canvasEl}/>
    </div>
  );
};