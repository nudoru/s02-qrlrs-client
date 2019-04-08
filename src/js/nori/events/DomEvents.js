//https://developer.mozilla.org/en-US/docs/Web/Events
export const domEventsList = [
  'focus',
  'blur',
  'resize',
  'scroll',
  'keydown',
  'keypress',
  'keyup',
  'mouseenter',
  'mousemove',
  'mousedown',
  'mouseover',
  'mouseup',
  'click',
  'dblclick',
  'contextmenu',
  'wheel',
  'mouseleave',
  'mouseout',
  'select',
  'change',
  'input'
];

export const isDomEvent = e => domEventsList.includes(e);