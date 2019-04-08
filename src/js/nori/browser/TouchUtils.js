// https://github.com/filamentgroup/tappy/blob/master/tappy.js
export const getTouchCoordsFromEvent = evt => {
  let ev      = evt.originalEvent || evt,
      touches = ev.touches || ev.targetTouches;

  if (touches) {
    return [touches[0].pageX, touches[0].pageY];
  }
  return null;
};
