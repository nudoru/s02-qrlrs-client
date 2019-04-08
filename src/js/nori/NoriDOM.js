import decamelize from 'decamelize';
import {enqueueDidMount, performDidMountQueue} from './LifecycleQueue';
import {renderVDOM} from "./Nori";
import {removeComponentInstance} from './Reconciler';
import {removeAllElements} from "./browser/DOMToolbox";
import is from './util/is';

const ID_KEY        = 'data-nori-id';
const SHOW_ID_KEYS  = false;
const isEvent       = event => /^on/.test(event);
const getEventName  = event => event.slice(2).toLowerCase();
// "Special props should be updated as new props are added to components.
const specialProps  = ['tweens', 'state', 'actions', 'children', 'element', 'min', 'max', 'mode', 'context','ref']; // TODO move this to another file
const isSpecialProp = test => specialProps.includes(test);

let _eventMap            = {},
    _renderedElementsMap = {},
    _$documentHostNode;

export const render = (component, hostNode) => {
  console.time('render');
  removeAllElements(hostNode);
  _$documentHostNode = hostNode;
  const vdom         = renderVDOM(component);
  patch(null)(vdom);
  // mount not using path : _$documentHostNode.appendChild(createDOMNode(vdom));
  performDidMountQueue();
  console.timeEnd('render');
  console.log('----------------------------------------------------------------------\n\n\n');
};

export const patch = currentvdom => newvdom => {
  let patches = [];
  paint(_$documentHostNode, newvdom, currentvdom, 0, patches);
  return patches;
};

// Affect the DOM
const paint = ($element, newvdom, currentvdom, index = 0, patches) => {
  if (newvdom && is.undef(currentvdom)) {
    const $newElement = createDOMNode(newvdom);
    $element.appendChild($newElement);
    // console.log('Append', currentvdom,'vs',newvdom, $newElement);
    patches.push({
      type  : 'APPEND',
      node  : $newElement,
      parent: $element,
      vnode : newvdom
    });
  } else if (is.undef(newvdom)) {
    const $toRemove = getELForVNode(currentvdom, $element);
    if ($toRemove && $toRemove.parentNode === $element) {
      // console.log('Remove', currentvdom, $toRemove);
      removeComponentInstance(currentvdom);
      // if (currentvdom.hasOwnProperty('props')) {
      //   removeEvents(currentvdom.props.id); // This is done in removeComponentInstance
      // }
      $element.removeChild($toRemove);
      if (currentvdom.hasOwnProperty('props')) {
        delete _renderedElementsMap[currentvdom.props.id];
      }
      patches.push({
        type  : 'REMOVE',
        node  : $toRemove,
        parent: $element,
        vnode : currentvdom
      });
    } else {
      console.warn(`wanted to remove`, currentvdom, `but it wasn't there or the parent is wrong`);
      console.warn('$element, $toRemove', $element, $toRemove);
    }
  } else if (changed(newvdom, currentvdom)) {
    // This needs to be smarter - Rearrange rather than replace and append
    // There is problem when multiple new nodes are inserted at separate indices in that
    // existing nodes are mutated to a new node type and the reference to that original
    // element is lost.
    const $newElement = createDOMNode(newvdom);
    //, $newElement,$element.childNodes[index]
    // console.log('Replace', currentvdom,'vs',newvdom, $element.childNodes[index],'with',$newElement);
    $element.replaceChild($newElement, $element.childNodes[index]);
    patches.push({
      type   : 'REPLACE',
      oldNode: $element.childNodes[index],
      node   : $newElement,
      parent : $element,
      vnode  : newvdom
    });
  } else if (newvdom.type) {
    // If it's a component, iterate over children
    updateProps(
      $element.childNodes[index],
      newvdom.props,
      currentvdom.props
    );
    const newLength = newvdom.children.length;
    const oldLength = currentvdom.children.length;
    const len       = Math.max(newLength, oldLength);
    for (let i = 0; i < len; i++) {
      paint($element.childNodes[index], newvdom.children[i], currentvdom.children[i], i, patches);
    }
  }
};

const changed = (newNode, oldNode) => {
  return typeof newNode !== typeof oldNode ||
    (typeof newNode === 'string' || typeof newNode === 'number' || typeof newNode === 'boolean') && newNode !== oldNode ||
    newNode.type !== oldNode.type
};

const getELForVNode = (vnode, $domRoot) => {
  if (!vnode) {
    return $domRoot;
  } else {
    const $element = vnode.hasOwnProperty('props') ? _renderedElementsMap[vnode.props.id] : null;
    if (!$element) {
      console.warn(`correlateVDOMNode : Couldn't get rendered element ${vnode.props.id}`);
    }
    return $element;
  }
};

const createDOMNode = vnode => {
  let $element;
  const ownerComp = vnode._owner !== null && vnode._owner !== undefined ? vnode._owner : null;

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    $element = createTextNode(vnode);
  } else if (typeof vnode === 'object' && typeof vnode.type === 'string') {
    $element = document.createElement(vnode.type);
    if (vnode.hasOwnProperty('children')) {
      vnode.children
        .map(createDOMNode)
        .forEach(child => $element.appendChild(child));
    }
  } else if (typeof vnode === 'function') {
    // TODO shouldn't this be fixed in the vdom stage before it gets here?
    // console.warn('createDOMNode : expected vdom, vnode is a function', vnode);
    return createTextNode('createDOMNode : expected vdom, vnode is a function', vnode);
  } else {
    console.warn(`createElement: Unknown node type ${typeof vnode} : ${vnode.type}`, vnode);
    return createTextNode(`createElement: Unknown node type ${typeof vnode} : ${vnode.type}`);
  }

  if (ownerComp) {
    ownerComp.$current = $element;
    if (typeof ownerComp.componentDidMount === 'function') {
      enqueueDidMount(ownerComp.componentDidMount);
    }
  }

  // Is there any benefit to moving this work to after all of the DOM work is done?
  applyProps($element, vnode.props || {});
  applyEvents(vnode, $element);

  if (vnode.hasOwnProperty('props')) {
    _renderedElementsMap[vnode.props.id] = $element;
  }
  return $element;
};

const createTextNode = string => document.createTextNode(string);

//------------------------------------------------------------------------------
//EVENTSEVENTSEVENTSEVENTSEVENTSEVENTSEVENTSEVENTSEVENTSEVENTSEVENTSEVENTSEVENTS
//------------------------------------------------------------------------------

const applyEvents = (vnode, $element) => {
  const props = vnode.props || {};
  marshalEventProps(props).forEach(evt => {
    const nodeId = vnode.props.id;
    // if(evt.event === 'input') {
    //   // Auto debounce?
    // }
    evt.internalHandler = internalEventHandler(evt, vnode, $element);
    $element.addEventListener(evt.event, evt.internalHandler);
    if (!_eventMap.hasOwnProperty(nodeId)) {
      _eventMap[nodeId] = [];
    }
    // Push an event remover fn to a queue
    _eventMap[nodeId].push(() => $element.removeEventListener(evt.event, evt.internalHandler));
  });
};

const marshalEventProps = props => Object.keys(props).reduce((acc, key) => {
  let value = props[key],
      evt   = isEvent(key) ? getEventName(key) : null;
  if (evt !== null) {
    acc.push({
      event                : evt,
      componentEventHandler: value,
      internalHandler      : null
    });
  }
  return acc;
}, []);

const internalEventHandler = (evt, vnode, $element) => e => evt.componentEventHandler(createProxyEventObject(e, vnode, $element));

const createProxyEventObject = (event, vnode, $element = null) => ({
  event,
  vnode,
  target: $element
});

export const removeEvents = id => {
  if (_eventMap.hasOwnProperty(id)) {
    _eventMap[id].map(fn => {
      fn();
      return null;
    });
    delete _eventMap[id];
  }
};

//------------------------------------------------------------------------------
//PROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPROPSPRO
//------------------------------------------------------------------------------

const updateProps = ($element, newProps, oldProps = {}) => {
  const props = Object.assign({}, newProps, oldProps);
  Object.keys(props).forEach(key => {
    updateProp($element, key, newProps[key], oldProps[key]);
  });
};

const updateProp = ($element, key, newValue, oldValue) => {
  if (!newValue) {
    removeProp($element, key, oldValue);
  } else if (!oldValue || newValue !== oldValue) {
    applyProp($element, key, newValue);
  }
};

const applyProps = ($element, props) => Object.keys(props).forEach(key => {
  const value = props[key];
  applyProp($element, key, value);
  return $element;
});

const applyProp = ($element, key, value) => {
  if (!isSpecialProp(key) && !isEvent(key)) {
    if (key === 'style') {
      value = convertStylePropObjToHTML(value);
    } else if (key === 'className') {
      key = 'class';
    } else if (key === 'id') {
      if (!SHOW_ID_KEYS) {
        return;
      }
      key = ID_KEY;
    } else if (key === 'key') {
      if (!value) {
        return;
      }
      key = 'id';
    } else if (key === 'ref') {
      // This doesn't work because the vnodes are cloned so obj pass by reference is broken
      if(typeof value === 'object') {
        value.current = $element;
      } else if (typeof value === 'function') {
        value($element);
      } else {
        console.warn(`ref prop must be an object or a function: 'ref={el => refVar = el}'`);
      }
      return;
    }
    if (typeof value === 'boolean') {
      setBooleanProp($element, key, value);
    } else {
      $element.setAttribute(key, value);
    }
  }
};

// convert "object" style css prop names back to hyphenated html/css styles
const convertStylePropObjToHTML = obj => Object.keys(obj).reduce((acc, k) => {
  acc.push(`${decamelize(k, '-')}: ${obj[k]}`);
  return acc;
}, []).join('; ');

const setBooleanProp = ($element, key, value) => {
  if (value) {
    $element.setAttribute(key, value);
    $element[key] = true;
  } else {
    $element[key] = false;
  }
};

const removeProp = ($element, key, value) => {
  if (!isSpecialProp(key)) {
    if (key === 'className') {
      key = 'class';
    } else if (key === 'id') {
      key = 'data-nid';
    }
    if (typeof value === 'boolean') {
      removeBooleanProp($element, key);
    } else {
      $element.removeAttribute(key);
    }
  }
};

const removeBooleanProp = ($element, key) => {
  $element.removeAttribute(key);
  $element[key] = false;
};