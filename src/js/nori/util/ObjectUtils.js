import Is from './is.js';

/**
 * Test for
 * Object {"": undefined}
 * Object {undefined: undefined}
 * @param obj
 * @returns {boolean}
 */
export const isNull = (obj) => {
  let isnull = false;

  if (Is.falsey(obj)) {
    return true;
  }

  for (let prop in obj) {
    if (prop === undefined || obj[prop] === undefined) {
      isnull = true;
    }
    break;
  }

  return isnull;
};

export const keysOf = obj => obj instanceof Object && Object.keys(obj) || [];

export const dynamicSort = (property) => {
  return function (a, b) {
    return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
  };
};

export const searchObjects = (obj, key, val) => {
  let objects = [];
  for (let i in obj) {
    if (typeof obj[i] === 'object') {
      objects = objects.concat(searchObjects(obj[i], key, val));
    } else if (i === key && obj[key] === val) {
      objects.push(obj);
    }
  }
  return objects;
};