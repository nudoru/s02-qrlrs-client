import {rndNumber} from './NumberUtils'

export const arrify = (a) => {
  return Array.prototype.slice.call(a, 0);
};

// Reference: http://jhusain.github.io/learnrx/index.html
export const mergeAll = () => {
  let results = [];

  this.forEach(function (subArr) {
    subArr.forEach(function (elm) {
      results.push(elm);
    });
  });

  return results;
};

// http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
export const unique = (arry) => {
  let o = {},
      i,
      l = arry.length,
      r = [];
  for (i = 0; i < l; i += 1) {
    o[arry[i]] = arry[i];
  }
  for (i in o) {
    r.push(o[i]);
  }
  return r;
};

export const removeIndex = (arr, idx) => {
  return arr.splice(idx, 1);
};

export const removeItem = (arr, item) => {
  let idx = arr.indexOf(item);
  if (idx > -1) {
    arr.splice(idx, 1);
  }
};

export const rndElement = (arry) => {
  return arry[rndNumber(0, arry.length - 1)];
};

export const getRandomSetOfElements = (srcarry, max) => {
  let arry = [],
      i    = 0,
      len  = rndNumber(1, max);

  for (; i < len; i++) {
    arry.push(this.rndElement(srcarry));
  }

  return arry;
};

export const getDifferences = (arr1, arr2) => {
  let dif = [];

  arr1.forEach(function (value) {
    let present = false,
        i       = 0,
        len     = arr2.length;

    for (; i < len; i++) {
      if (value === arr2[i]) {
        present = true;
        break;
      }
    }

    if (!present) {
      dif.push(value);
    }

  });

  return dif;
};

export const arryArryToArryObj = (src, keys) => {
  return src.reduce((p, c) => {
    var row = {};
    keys.forEach((col, i) => {
      row[col] = c[i];
    });
    p.push(row);
    return p;
  }, []);
};

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
  }
  return array;
};

export const range = len => ([...Array(len).keys()]);

export const flatten = arry => [].concat.apply([], arry);