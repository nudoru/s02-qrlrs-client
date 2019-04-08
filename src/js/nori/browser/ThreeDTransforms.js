import {TweenLite} from 'gsap';

/**
 * Create shared 3d perspective for all children
 * @param el
 */
export const apply3DToContainer = el => {
  TweenLite.set(el, {
    css: {
      perspective      : 800,
      perspectiveOrigin: '50% 50%'
    }
  });
};

/**
 * Apply basic CSS props
 * @param el
 */
export const apply3DToElement = el => {
  TweenLite.set(el, {
    css: {
      transformStyle    : "preserve-3d",
      backfaceVisibility: "hidden",
      transformOrigin   : '50% 50%'
    }
  });
};

/**
 * Apply basic 3d props and set unique perspective for children
 * @param el
 */
export const applyUnique3DToElement = el => {
  TweenLite.set(el, {
    css: {
      transformStyle      : "preserve-3d",
      backfaceVisibility  : "hidden",
      transformPerspective: 600,
      transformOrigin     : '50% 50%'
    }
  });
};
