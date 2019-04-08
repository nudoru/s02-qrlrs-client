/*eslint no-undef: "error"*/
/*eslint-env node*/

/*
 Collected utility functions
 */


/**
 * Turn an object of {paramname:value[,...]} into paramname=value[&...] for a
 * URL rest query
 */
export const getParameterString = (objArry) => {
  return Object.keys(objArry).reduce((p, c, i) => {
    p += (i > 0 ? '&' : '') + c + '=' + encodeURIComponent(objArry[c]);
    return p;
  }, '');
};

export const decodeParameterString = (str) => {
  return str.split('&').reduce((p, c) => {
    let pair   = c.split('=');
    p[pair[0]] = decodeURIComponent(pair[1]);
    return p;
  }, {});
};

export const sleep = (time) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, time);
  });
};