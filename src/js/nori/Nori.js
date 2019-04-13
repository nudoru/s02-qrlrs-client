/*
TODO
  - Catch state setter during construction or initial render and don't update or rerender
  - HOOKS
    - move hooks to new files
    - how to separate currentVnode cursor
    - use hooks outside of render?
    - use hooks in SFC?
  - update lister with my usestate as a test
  - test render props pattern https://www.robinwieruch.de/react-render-props-pattern/
  - use this list to preinit common tags? https://www.npmjs.com/package/html-tags
    - ex: https://github.com/alex-milanov/vdom-prototype/blob/master/src/js/util/vdom.js#L190
    - // Super slick ES6 one liner factory function!
      const greetingFactory = (name) => Reflect.construct(Greeting, [name]);
  - throw errors and error boundaries
  - update props
  - memo components
  - pure components - no update if state didn't change
  - context?
  - refs?
  - spinner https://github.com/davidhu2000/react-spinners/blob/master/src/BarLoader.jsx
  - create a fn that will determine if the vnode has been rendered and call render or update as appropriate
  - test form input
  - Element or wrapper for text nodes?
  - use ImmutableJS data structures
  - test fn as prop value
  - test my mouse renderprops
  - in component constructor, call super w/ only props
  - Memoize? https://blog.javascripting.com/2016/10/05/building-your-own-react-clone-in-five-easy-steps/
 */

import {flatten} from "./util/ArrayUtils";
import {
  enqueueDidUpdate,
  getDidUpdateQueue,
  performDidMountQueue,
  performDidUpdateQueue
} from './LifecycleQueue';
import {patch} from './NoriDOM';
import NoriComponent from "./NoriComponent";
import {
  cloneNode,
  getComponentInstances, processTree,
  reconcileOnly, reconcileTree
} from "./Reconciler";

const STAGE_UNITIALIZED = 'uninitialized';
const STAGE_FIRSTRENDER = 'first_render';
const STAGE_RENDERING   = 'rendering';
const STAGE_UPDATING    = 'updating';
const STAGE_STEADY      = 'steady';

const UPDATE_TIMEOUT = 10;  // how ofter the update queue runs

let _currentVDOM,
    _updateTimeOutID,
    _currentStage = STAGE_UNITIALIZED;

export const isNoriElement   = test => test.$$typeof && Symbol.keyFor(test.$$typeof) === 'nori.element';
export const isTypeFunction  = vnode => typeof vnode === 'object' && typeof vnode.type === 'function';
export const isNori          = test => Object.getPrototypeOf(test) === NoriComponent || test instanceof NoriComponent;
export const isNoriComponent = vnode => isTypeFunction(vnode) && isNori(vnode.type);
export const setCurrentVDOM  = tree => _currentVDOM = tree;
export const getCurrentVDOM  = _ => cloneNode(_currentVDOM);
export const isUninitialized = _ => _currentStage === STAGE_UNITIALIZED;
export const isInitialized   = _ => _currentStage !== STAGE_UNITIALIZED;
export const isFirstRender   = _ => _currentStage === STAGE_FIRSTRENDER;
export const isRendering     = _ => _currentStage === STAGE_RENDERING;
export const isUpdating      = _ => _currentStage === STAGE_UPDATING;
export const isSteady        = _ => _currentStage === STAGE_STEADY;

//------------------------------------------------------------------------------
//PUBLICPUBLICPUBLICPUBLICPUBLICPUBLICPUBLICPUBLICPUBLICPUBLICPUBLICPUBLICPUBLIC
//------------------------------------------------------------------------------

// Create VDOM from JSX. Used by the Babel/JSX transpiler
export const h = (type, props, ...args) => {
  // console.log(`h ${type} ${JSON.stringify(props)} ${JSON.stringify(args)}`);
  return {
    type,
    props   : props || {},
    children: args.length ? flatten(args) : [],
    _owner  : null,
    $$typeof: Symbol.for('nori.element')
  }
};

// Called from NoriDOM to render the first vdom
export const renderVDOM = node => {
  _currentStage = isUninitialized() ? STAGE_FIRSTRENDER : STAGE_RENDERING;
  const vdom    = reconcileTree(node);
  setCurrentVDOM(vdom);
  _currentStage = STAGE_STEADY;
  return vdom;
};

//------------------------------------------------------------------------------
//STATEUPDATESTATEUPDATESTATEUPDATESTATEUPDATESTATEUPDATESTATEUPDATESTATEUPDATES
//------------------------------------------------------------------------------

// Queue updates from components and batch update every so often
// Called from NoriComponent set state
export const enqueueUpdate = id => {
  if (isFirstRender()) {
    //console.warn(`not enqueuing updates on first render! ${id}`);
    return;
  }

  enqueueDidUpdate(id);
  if (!_updateTimeOutID) {
    _updateTimeOutID = setTimeout(performUpdates, UPDATE_TIMEOUT);
  }
};

const performUpdates = () => {
  if (isRendering()) {
    console.warn(`>>> Update called while rendering`);
    return;
  }
  clearTimeout(_updateTimeOutID);
  _updateTimeOutID      = null;
  _currentStage         = STAGE_RENDERING;
  const currentVdom     = getCurrentVDOM();
  const updatedNodes = getDidUpdateQueue();
  const updatedVDOMTree = updatedNodes.reduce((acc, id) => {
    acc = reconcileOnly(id)(acc);
    return acc;
  }, currentVdom);
  processTree(updatedVDOMTree);
  patch(currentVdom)(updatedVDOMTree);
  setCurrentVDOM(updatedVDOMTree);
  performDidMountQueue();
  _currentStage = STAGE_UPDATING;
  performDidUpdateQueue(getComponentInstances());
  _currentStage = STAGE_STEADY;
  // console.timeEnd('update');
};