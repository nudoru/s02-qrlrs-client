import {range} from './ArrayUtils';

export const repeatStr = (str,num) => range(num).map(n => str).join('');


export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.substring(1);
};

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1);
  });
};


export const ellipses = (len) => {
  return (this.length > len) ? this.substr(0, len) + "..." : this;
};

// From https://github.com/sstephenson/prototype/blob/d9411e5/src/prototype/lang/string.js#L426
// export const removeTags2 = (str) => {
//   return str.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
// };

export const removeTags = (str) => {
  return str.replace(/(<([^>]+)>)/ig, '');
};

export const removeEntities = (str) => {
  return str.replace(/(&(#?)(?:[a-z\d]+|#\d+|#x[a-f\d]+);)/ig, '');
};

// From https://github.com/sstephenson/prototype/blob/d9411e5/src/prototype/lang/string.js#L426
export const unescapeHTML = (str) => {
  // Warning: In 1.7 String#unescapeHTML will no longer call String#stripTags.
  return removeTags(str).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

export const underscore = (str) => {
  return str.replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
};

export const dasherize = (str) => {
  return str.replace(/_/g, '-');
};

export const DOMtoCSSStyle = (str) => {
  return dasherize(underscore(str));
};

export const removeWhiteSpace = (str) => {
  return str.replace(/(\r\n|\n|\r|\t|\s)/gm, '').replace(/>\s+</g, '><');
};


export const slugify = str => str.split(' ').map(s => s.toLowerCase()).join('_');
export const unslugify = str => str.split('_').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');