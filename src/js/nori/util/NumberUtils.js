export const isInteger = (str) => {
  return (/^-?\d+$/.test(str));
};

export const rndNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (val, min, max) => {
  return Math.max(min, Math.min(max, val));
};

export const isBetween = (val, min, max) => {
  return val > min && val < max;
};

export const distanceTL = (point1, point2) => {
  var xd = (point2.left - point1.left),
      yd = (point2.top - point1.top);
  return Math.sqrt((xd * xd) + (yd * yd));
};