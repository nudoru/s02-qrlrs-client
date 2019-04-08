/*
Different stuff collected over time. Most of it used in one project or another
in the past.
 */

import {curry, memoize} from 'ramda';

export const $ = (selector, context) => {
  return (context || document).querySelector(selector);
};

export const $$ = (selector, context) => {
  return (context || document).querySelectorAll(selector);
};

export const getElStyle = el => window.getComputedStyle(el);

export const getElStyleProp = memoize(curry((el, prop) => getElStyle(el).getPropertyValue(prop)));

// converts a style value from '##px' to '##'
export const pxToInt = str => parseInt(str.substr(0, str.length - 2));

// http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
// element must be entirely on screen
export const isElementEntirelyInViewport = el => {
  let rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// element may be partially on screen
export const isElementInViewport = el => {
  let rect = el.getBoundingClientRect();
  return rect.bottom > 0 &&
    rect.right > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.top < (window.innerHeight || document.documentElement.clientHeight);
};

export const isDomObj = (obj) => {
  return !!(obj.nodeType || (obj === window));
};

export const position = el => {
  return {
    left: el.offsetLeft,
    top : el.offsetTop
  };
};

// from http://jsperf.com/jquery-offset-vs-offsetparent-loop
export const offset = el => {
  let ol = 0,
      ot = 0;
  if (el.offsetParent) {
    do {
      ol += el.offsetLeft;
      ot += el.offsetTop;
      el = el.offsetParent;
    } while (el); // jshint ignore:line
  }
  return {
    left: ol,
    top : ot
  };
};

export const removeAllElements = el => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

export const removeElement = el => {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
};

export const appendElement = (root, el) => {
  let parent = isDomObj(root) ? root : document.querySelector(root);
  if (parent) {
    parent.appendChild(el);
  } else {
    console.warn('Can\'t append element, selector not found: ', root);
  }
};

export const replaceElement = (root, el) => {
  if (el.parentElement) {
    let parent      = isDomObj(root) ? root : document.querySelector(root),
        nextSibling = el.nextSibling;
    if (parent) {
      parent.removeChild(el);
      parent.insertBefore(el, nextSibling);
    } else {
      console.warn('Can\'t append element, selector not found: ', root);
    }
  } else {
    appendElement(el, root);
  }
  return el;
};

export const replaceElementWith = (oldEl, newEl, parentEl) => {
  let parent = parentEl || oldEl.parentElement;
  if (parent) {
    let nextSibling = oldEl.nextSibling;
    parent.removeChild(oldEl);
    parent.insertBefore(newEl, nextSibling);
    return newEl;
  }
  console.warn('Can\'t replace element, no parent found', parent);
  return false;
};

export const escapeHTML = str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

//https://davidwalsh.name/convert-html-stings-dom-nodes
export const HTMLStrToNode = str => {
  return document.createRange().createContextualFragment(str);
};

export const wrapElement = (wrapperStr, el) => {
  let wrapperEl = HTMLStrToNode(wrapperStr),
      elParent  = el.parentNode;

  wrapperEl.appendChild(el);
  elParent.appendChild(wrapperEl);
  return wrapperEl;
};

// http://stackoverflow.com/questions/15329167/closest-ancestor-matching-selector-using-native-dom
export const closest = (root, el) => {
  let matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
  while (el) {
    if (matchesSelector.bind(el)(root)) {
      return el;
    } else {
      el = el.parentElement;
    }
  }
  return false;
};

// from youmightnotneedjquery.com
export const hasClass = (className, el) => {
  if (el.classList) {
    el.classList.contains(className);
  } else {
    new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  }
};

export const addClass = (el, className) => {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
};

export const removeClass = (el, className) => {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
};

export const toggleClass = (el, className) => {
  if (this.hasClass(el, className)) {
    this.removeClass(el, className);
  } else {
    this.addClass(el, className);
  }
};

// From impress.js
export const applyCSS = (el, props) => {
  let key;
  for (key in props) {
    if (props.hasOwnProperty(key)) {
      el.style[key] = props[key];
    }
  }
  return el;
};

// from impress.js
// `computeWindowScale` counts the scale factor between window size and size
// defined for the presentation in the config.
export const computeWindowScale = config => {
  let hScale = window.innerHeight / config.height,
      wScale = window.innerWidth / config.width,
      scale  = hScale > wScale ? wScale : hScale;

  if (config.maxScale && scale > config.maxScale) {
    scale = config.maxScale;
  }

  if (config.minScale && scale < config.minScale) {
    scale = config.minScale;
  }

  return scale;
};

/**
 * Get an array of elements in the container returned as Array instead of a Node list
 */
export const querySelectorAllAsArray = (el, cls) => {
  return Array.prototype.slice.call(el.querySelectorAll(cls), 0);
};

export const centerElementInViewPort = el => {
  let vpH = window.innerHeight,
      vpW = window.innerWidth,
      elR = el.getBoundingClientRect(),
      elH = elR.height,
      elW = elR.width;

  el.style.left = (vpW / 2) - (elW / 2) + 'px';
  el.style.top  = (vpH / 2) - (elH / 2) + 'px';
};