/* Let's play with hooks!
https://reactjs.org/docs/hooks-reference.html
React's Rules:
  1. must be called at in the redner fn
  2. called in the same order - not in a conditional
  3. No loops

  Some hooks are called as soon as they are encountered like useState
  Some are called AFTER the element has mounted like useEffect
    - need to add a the cDM queue in lifecycle

*/

import {equals} from 'ramda';
import {getCurrentVnode, getHookCursor} from "./Reconciler";
import {enqueueUpdate, isSteady} from "./Nori";
import {enqueuePostRenderHook} from "./LifecycleQueue";

let _hooksMap = {};

export const HOOK_TAGS = {
  EFFECT       : 'useEffect',
  LAYOUT_EFFECT: 'useLayoutEffect',
  REF          : 'useRef'
};

// Returns true if first call, false if n+ call
const registerHook = (type, value) => {
  // Make sure hooks are only used during rendering
  if (isSteady()) {
    console.warn('Hooks can only be called inside the body of a function component!');
    return;
  }

  let initial = false,
      cVnode  = getCurrentVnode(),
      cursor  = getHookCursor();

  if (!cVnode) {
    console.warn(`registerHook : Can't register hook, no current vnode!`);
    return;
  }
  const id = cVnode.props.id;

  if (!_hooksMap.hasOwnProperty(id)) {
    _hooksMap[id] = [];
  }
  if (!_hooksMap[id][cursor]) {
    initial = true;
    _hooksMap[id].push({type, vnode: cVnode, data: value});
    //console.log(`NEW hook ${type} for ${id} at ${cursor}`, value);
  }
  return {initial, id, cursor, hook: _hooksMap[id][cursor]};
};

const setHookData = (id, cursor, data) => {
  _hooksMap[id][cursor].data = data;
};

const getHookData = (id, cursor) => _hooksMap[id][cursor].data;

export const unregisterHooks = (id) => {
  if (_hooksMap.hasOwnProperty(id)) {
    delete _hooksMap[id];
  }
};

// Implementation w/o useReducer
// export const useState = initialState => {
//   const res          = registerHook('useState', initialState);
//   const currentState = res.hook.data;
//   const setState     = newState => {
//     setHookData(res.id, res.cursor, newState);
//     enqueueUpdate(res.id);
//   };
//   return [currentState, setState];
// };

export const useState = initialState => {
  // Returning the action from the reducer because the argument of the setState() fn
  // is expected to be the new state, not the action as in the case of useReducer's dispatch() fn
  const [currentState, dispatch] = useReducer((state, action) => action, initialState);
  return [currentState, dispatch];
};

export const useReducer = (reduceFn, initialState) => {
  const res          = registerHook('useReducer', initialState);
  const currentState = res.hook.data;
  const dispatch     = action => {
    const newState = reduceFn(getHookData(res.id, res.cursor), action);
    setHookData(res.id, res.cursor, newState);
    enqueueUpdate(res.id);
  };
  return [currentState, dispatch];
};

export const useMemo = (callbackFn, deps) => {
  let res           = registerHook('useMemo', {
    callback    : callbackFn,
    dependencies: deps,
    output      : null
  });
  const changedDeps = !equals(deps, res.hook.data.dependencies);
  if (res.initial || deps === undefined || changedDeps) {
    const result = callbackFn();
    setHookData(res.id, res.cursor, {
      callback    : callbackFn,
      dependencies: deps,
      output      : result
    });
    return result;
  }
  return res.hook.data.output;
};

// https://twitter.com/dan_abramov/status/1055709764036943872?lang=en
export const useCallBack = (callbackFn, deps) => {
  return useMemo(callbackFn, deps);
};

export const useEffect = (callbackFn, deps) => {
  let res           = registerHook('useEffect', {
    callback    : callbackFn,
    dependencies: deps
  });
  const changedDeps = !equals(deps, res.hook.data.dependencies);
  if (deps === undefined || changedDeps) {
    setHookData(res.id, res.cursor, {
      callback    : callbackFn,
      dependencies: deps
    });
    enqueuePostRenderHook(HOOK_TAGS.EFFECT, res.id, callbackFn);
  } else if (res.initial || deps.length === 0) {
    enqueuePostRenderHook(HOOK_TAGS.EFFECT, res.id, callbackFn);
  }
};

// TODO this needs to run right after the component is rendered not after everything renders
export const useLayoutEffect = (callbackFn, deps) => {
  useEffect(callbackFn, deps);
};

export const useRef = initialValue => {
  let res = registerHook('useRef', {}),
      returnObj;

  if (res.initial) {
    returnObj = {current: initialValue};
    setHookData(res.id, res.cursor, returnObj);
  } else {
    returnObj = res.hook.data;
  }

  return returnObj;
};

export const useContext = context => {
  // replaces the "consumer"
  // need to add the component as a consumer to the Provider also
  // return context.Provider.value
  // PROBLEM - how to get the Provider into here? Just passing in the content gets the
  // Provider class, not the instance of the provider that has the data
  console.warn(`useContext hook isn't implemented`);
};