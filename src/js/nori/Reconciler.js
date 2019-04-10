import {compose} from "ramda";
import Is from "./util/is";
import {getNextId} from "./util/ElementIDCreator";
import {isNori, isNoriComponent, isTypeFunction} from "./Nori";
import {cloneDeep} from "lodash";
import {performPostRenderHookCleanup} from "./LifecycleQueue";
import {removeEvents} from "./NoriDOM";
import {unregisterHooks} from "./Hooks";
import {Consumer, Provider} from './Context';
import {repeatStr} from "./util/StringUtils";

let _componentInstanceMap        = {},
    _currentVnode,
    _currentVnodeHookCursor      = 0,
    _currentContextProvider,
    _currentContextProviderIndex = 0,
    _reconciliationDepth         = 0;

const getKeyOrId                 = vnode => vnode.props.key ? vnode.props.key : vnode.props.id;
const isVDOMNode                 = vnode => typeof vnode === 'object' && vnode.hasOwnProperty('type') && vnode.hasOwnProperty('props') && vnode.hasOwnProperty('children');
const hasOwnerComponent          = vnode => vnode.hasOwnProperty('_owner') && vnode._owner !== null;
const reconcileComponentInstance = vnode => compose(renderComponent, getComponentInstance)(vnode);
const isProvider                 = vnode => vnode.hasOwnProperty('_owner') && vnode._owner instanceof Provider;
const isConsumer                 = vnode => vnode.hasOwnProperty('_owner') && vnode._owner instanceof Consumer;

export const cloneNode             = vnode => cloneDeep(vnode);
export const getComponentInstances = _ => _componentInstanceMap;
export const getCurrentVnode       = _ => _currentVnode;
export const setCurrentVnode       = vnode => {
  _currentVnodeHookCursor = 0;
  _currentVnode           = vnode;
};
export const getHookCursor         = _ => _currentVnodeHookCursor++;

// Start off the reconciliation process and keep track of the depth
export const reconcileTree = vnode => {
  _reconciliationDepth = 0;
  return reconcile(vnode, _reconciliationDepth);
};

// Need a persistant index because this fn is called at several places
const reconcile = (vnode, index = 0) => {
  setCurrentVnode(vnode);
  let indent = repeatStr('\t',index);
  //console.log(indent,index,vnode);
  if (index <= _currentContextProviderIndex) {
    _currentContextProvider = null;
  }
  if (isTypeFunction(vnode)) {
    vnode = reconcileComponentInstance(vnode);
    if (isProvider(vnode)) {
      if (index > _currentContextProviderIndex) {
        // TODO merge this value w/ the old one
        console.warn(`Not handling nested providers yet`);
      }
      // console.log(indent, `Provider: `,index, _currentContextProviderIndex);
      _currentContextProvider      = vnode._owner;
      _currentContextProviderIndex = index;
    } else if (isConsumer(vnode) && _currentContextProvider) {
      // console.log(indent, `Consumer: `,index, _currentContextProviderIndex);
      vnode.props.context = _currentContextProvider.value;
      _currentContextProvider.addConsumer(vnode);
    } else if (isConsumer(vnode)) {
      console.warn(`Use of a context consumer outside the scope of a provider.`)
    }

    // TODO this needs more testing
    if(isTypeFunction(vnode)) {
      console.log(indent,index,'fn node returns a fn', vnode);
      vnode = reconcile(vnode, index)
    }
  }

  //return reconcileChildren(vnode, reconcile);
  if (vnode.hasOwnProperty('children') && vnode.children.length) {
    ++index; //added for context / depth tracking
    vnode.children = reconcileChildFunctions(vnode).map(v => {
      return reconcile(v, index);
    });
  }
  return vnode;
};

export const reconcileOnly = id => vnode => {
  vnode = cloneNode(vnode);
  setCurrentVnode(vnode);
  if (hasOwnerComponent(vnode) && vnode.props.id === id) {
    vnode = reconcileComponentInstance(vnode);
  } else if (hasOwnerComponent(vnode) && vnode._owner.props.id === id) {
    vnode = reconcileComponentInstance(vnode._owner);
  } else if (isTypeFunction(vnode)) {
    vnode = reconcileTree(vnode);
  }
  return reconcileChildren(vnode, reconcileOnly(id));
};

const reconcileChildren = (vnode, mapper) => {
  if (vnode.hasOwnProperty('children') && vnode.children.length) {
    vnode.children = reconcileChildFunctions(vnode).map(mapper);
  }
  return vnode;
};

// If children are an inline fn, render and insert the resulting children in to the
// child array at the location of the fn
// works backwards so the insertion indices are correct
const reconcileChildFunctions = vnode => {
  let children    = vnode.children,
      result      = [],
      resultIndex = [],
      index       = 0;
  children        = children.map((child, i) => {
    if(child === null || child === undefined) {
      return '';
    } else if (typeof child === 'function') {
      // Render fn as child
      let childResult;
      try {
        if (isConsumer(vnode)) {
          // Context
          childResult = child(vnode.props.context);
        } else {
          childResult = child();
        }
      } catch (err) {
        console.error(`Error executing child function: `, err);
        childResult = 'Error executing child function.';
      }

      childResult = Is.array(childResult) ? childResult : [childResult];
      childResult = childResult.map((c, i) => {
        if (isTypeFunction(c)) {
          c = reconcile(c);
        } else if (typeof c === 'object' && !getKeyOrId(c)) {
          // TODO Take in to account keys?
          c.props.id = c.props.id ? c.props.id : vnode.props.id + `.${i}.${index++}`;
        }
        return c;
      });
      result.unshift(childResult);
      resultIndex.unshift(i);
    } else if (child.hasOwnProperty('type') && typeof child.type === 'object') {
      // Occurs when a fn that returns JSX is used as a component in a component
      child = child.type;
    } //Not needed : else {child = reconcile(child);}
    return child;
  });
  resultIndex.forEach((idx, i) => {
    children.splice(idx, 1, ...result[i]);
  });
  return children;
};

// SFCs will pass to renderComponent
const getComponentInstance = vnode => {
  let id = getKeyOrId(vnode);
  if (_componentInstanceMap.hasOwnProperty(id)) {
    vnode = _componentInstanceMap[id];
  } else if (isNoriComponent(vnode)) {
    vnode = createNoriComponentInstance(vnode);
  }
  return vnode;
};

const createNoriComponentInstance = vnode => {
  vnode.props.children      = Is.array(vnode.children) ? vnode.children : [vnode.children];
  let instance              = new vnode.type(vnode.props);
  let id                    = instance.props.id; // id could change during construction
  _componentInstanceMap[id] = instance;
  return instance;
};

/*
To do
- Memoize result and return if props or state are the same?
- SFC tell if state or props changed?
 */
const renderComponent = instance => {
  if (typeof instance.internalRender === 'function') {
    let vnode    = instance.internalRender();
    vnode._owner = instance;
    return vnode;
  } else if (isTypeFunction(instance)) {
    return renderSFC(instance);
  } else if (hasOwnerComponent(instance)) {
    if (isNori(instance._owner)) {
      return renderComponent(instance._owner);
    }
    return renderSFC(instance._owner);
  } else if (isVDOMNode(instance)) {
    if (!instance.props.id) {
      instance.props.id = instance.props.key ? '' + instance.props.key : getNextId();
    }
    return instance;
  }
  return null;
};

const renderSFC = instance => {
  if (instance && typeof instance === 'object' && !instance.hasOwnProperty('type')) {
    console.warn(`renderSFC : This isn't a SFC!`, instance);
    return instance;
  }
  let vnode = instance.type(instance.props);
  if (!vnode.props.id) {
    vnode.props.id = instance.props.key ? '' + instance.props.key : instance.props.id;
  }
  vnode._owner = instance;
  return vnode;
};

// NoriDOM update() on when an element isn't in the new vdom tree
export const removeComponentInstance = vnode => {
  const id = getKeyOrId(vnode);

  performPostRenderHookCleanup(id);
  unregisterHooks(id);
  removeEvents(id);

  // Components
  if (_componentInstanceMap.hasOwnProperty(id)) {
    const compInst = _componentInstanceMap[id];
    if (typeof compInst.componentWillUnmount === 'function') {
      compInst.componentWillUnmount();
      compInst.remove();
    }
    delete _componentInstanceMap[id];
  }
};

/*
const diff = ($element, newvdom, currentvdom, index = 0, patches) => {
  if (newvdom && Is.undef(currentvdom)) {
    patches.push({
      type  : 'APPEND',
      //node  : $newElement,
      parent: $element,
      vnode : newvdom
    });
  } else if (Is.undef(newvdom)) {
    patches.push({
      type  : 'REMOVE',
      //node  : $toRemove,
      parent: $element,
      vnode : currentvdom
    });
  } else if (changed(newvdom, currentvdom)) {
    patches.push({
      type   : 'REPLACE',
      //oldNode: $element.childNodes[index],
      //node   : $newElement,
      //parent : $element,
      vnode  : newvdom
    });
  } else if (newvdom.type) {
    const newLength = newvdom.children.length;
    const oldLength = currentvdom.children.length;
    const len       = Math.max(newLength, oldLength);
    for (let i = 0; i < len; i++) {
      diff($element.childNodes[index], newvdom.children[i], currentvdom.children[i], i, patches);
    }
  }
};

const changed = (newNode, oldNode) => {
  return typeof newNode !== typeof oldNode ||
    (typeof newNode === 'string' || typeof newNode === 'number' || typeof newNode === 'boolean') && newNode !== oldNode ||
    newNode.type !== oldNode.type
};
 */