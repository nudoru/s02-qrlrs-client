export const drawPoly = (canvasObj, coords) => {
  const OUTLINE_COLOR = `#FF3B58`;
  drawLine(canvasObj, coords.topLeftCorner, coords.topRightCorner, OUTLINE_COLOR);
  drawLine(canvasObj, coords.topRightCorner, coords.bottomRightCorner, OUTLINE_COLOR);
  drawLine(canvasObj, coords.bottomRightCorner, coords.bottomLeftCorner, OUTLINE_COLOR);
  drawLine(canvasObj, coords.bottomLeftCorner, coords.topLeftCorner, OUTLINE_COLOR);
};

export const drawLine = (canvasEl, begin, end, color) => {
  canvasEl.beginPath();
  canvasEl.moveTo(begin.x, begin.y);
  canvasEl.lineTo(end.x, end.y);
  canvasEl.lineWidth   = 4;
  canvasEl.strokeStyle = color;
  canvasEl.stroke();
};