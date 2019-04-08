import {clone} from 'lodash';

let didMountQueue              = [],
    didUpdateQueue             = [],
    postRenderHookQueue        = [],
    postRenderHookCleanupQueue = [];

export const enqueueDidMount       = id => didMountQueue.push(id);
export const enqueueDidUpdate      = id => didUpdateQueue.push(id);
export const getDidUpdateQueue     = _ => clone(didUpdateQueue);
export const enqueuePostRenderHook = (tag, id, fn) => postRenderHookQueue.push({
  tag,
  id,
  fn
});
export const getDidMountQueue      = _ => clone(didMountQueue);

export const performDidMountQueue = () => {
  didMountQueue.forEach(fn => fn());
  didMountQueue = [];
  performPostRenderHooks();
};

export const performDidUpdateQueue = map => {
  didUpdateQueue.forEach(id => {
    if (map[id] && typeof map[id].componentDidUpdate === 'function') {
      map[id].componentDidUpdate()
    }
  });
  didUpdateQueue = [];
  performPostRenderHooks();
};

const performPostRenderHooks = () => {
  postRenderHookQueue.forEach(hook => {
    let {id, fn} = hook,
        result;
    performPostRenderHookCleanup(id);
    result = fn();
    if (result) {
      postRenderHookCleanupQueue.push({id, fn: result});
    }
  });
  postRenderHookQueue = [];
};

export const performPostRenderHookCleanup = id => {
  postRenderHookCleanupQueue = postRenderHookCleanupQueue.reduce((acc, hook) => {
    if (hook.id === id) {
      hook.fn();
    } else {
      acc.push(hook);
    }
    return acc;
  }, []);
};