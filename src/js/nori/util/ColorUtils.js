// based on the background color values (r,g,b) returns white or black for foreground color
// https://css-tricks.com/css-variables-calc-rgb-enforcing-high-contrast-colors/
export const getA11yForegroundColor = (r,g,b) => {
  let sum = Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);
  return (sum > 128) ? '#000000' : '#ffffff';
};