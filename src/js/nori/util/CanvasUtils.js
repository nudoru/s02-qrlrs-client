export const drawPoly = (context, coords) => {
  const OUTLINE_COLOR = `#FF3B58`;
  drawLine(context, coords.topLeftCorner, coords.topRightCorner, OUTLINE_COLOR);
  drawLine(context, coords.topRightCorner, coords.bottomRightCorner, OUTLINE_COLOR);
  drawLine(context, coords.bottomRightCorner, coords.bottomLeftCorner, OUTLINE_COLOR);
  drawLine(context, coords.bottomLeftCorner, coords.topLeftCorner, OUTLINE_COLOR);
};

export const drawLine = (context, begin, end, color) => {
  context.beginPath();
  context.moveTo(begin.x, begin.y);
  context.lineTo(end.x, end.y);
  context.lineWidth   = 10;
  context.strokeStyle = color;
  context.stroke();
};