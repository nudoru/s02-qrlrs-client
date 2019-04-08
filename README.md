# **README is most likely out of date!**

# Sketch 00 - Vanilla JS Template

Taking a break from React and playing around with the new Vanilla JS framework for experimentation and fun.

## GOALS!

- Experimentation! This is not for performance, this is not for large apps. This is just for fun.
- "React-like" JSX syntax
- more easily support animations than React
- more stuff

## Attribution

Large parts of the JSX, VDOM processing based on
- https://medium.com/@deathmood/how-to-write-your-own-virtual-dom-ee74acc13060

## Component

The component class abstracts the creation and basic management of a DOM node in a "Reactish" kinda-sorta way. Because the goal is to get DOM elements on the screen, no virtual DOM is used - just plain old appendChild. Snabbdom may be implemented in the future.

`let myComponent = new Component('base_tag', {attrs:{dom_element_attributes}, triggers:{events}, state:{initial_state}}, ['Text {{content}}' || [child_array]]);`


### base_tag

The type of DOM element that will be created to contain the children.

### props 

Object containing optional attrs, state and trigger keys.

#### attrs

Attributes that will be applied to the base DOM node. Should be camelCased. 

For CSS classes, the `class` attribute is used. You may use the output of a CSS in JS library such as emotion's css constructor. 

#### state

Object to populate the initial state.

### children

Either a plain text string or an array of text strings and other component instances.

When the parent element is updated (via new state) all of the children will be removed and recreated.

#### text strings

A string that may contain html tags that will used as a child of the base tag. Mustache templates maybe used with values populated from state.

#### array

An array of text strings or other other component instances.

### State updates

Update the state of any component instance by using the `componentInstance.state` setter function. A deep comparison is performed (using ramda's equal function) and if the state changed a rerender of the component and it's children is triggered.

### Events and Behaviors

Supports any JavaScript DOM event and a matching event handler. Refer to the list here: https://developer.mozilla.org/en-US/docs/Web/Events

*** Update with lifecycle hooks ***

Behaviors roughly translate to React Life-Cycle hooks: 

- stateChange : after the internal state has been updated 
- render : When the component has been added to the DOM. First render only!
- update :  Rerendered and added to the DOM
- willRemove : In process of being removed from the DOM.
- didDelete : Removed from the DOM, internal listeners removed and cache values null'd out.

#### Lifecycle

**Lifecycle hooks below**

[Calling component.renderTo()] -> render

[State update] -> stateChange -> willRemove -> update

[Calling component.delete()] -> willRemove -> didDelete

### Event callback functions

**Trigger event** functions are passed an event object with the following keys:

- event : the JavaScript event object that caused the event
- component : the component class
- element : the DOM node of the component

In the case of a **trigger behavior**, the event object has two keys: 

- type : the behavior string
- target : the DOM element

## Subclassing

Create custom components by subclassing. Reference the template below:

    import Component from './nori/Component';
    
    export default class Greeter extends Component {
    
      // Default state
      internalState = {name: 'Matt'};
    
      // Subclasses should only take passed props and children
      constructor(props, children) {
        // call super and pass what's needed
        // Define children in an array here or return in the render()
        super('h1', props, ['Hello, <em>{{name}}!</em>']);
      }
    
      // Override fn's
      render() {
        // Put plain text in an [array] or return more components
        return <h1>Hi mom!</h1>
      }
    }

## JSX Support

The Parcel/Babel build supports JSX with only one additional package to install: `babel-preset-react`. 

### Writing JSX

The `h` helper function follows the React.createElement syntax and may be used int its place. Make user the proper JSX pragma is present at the top of every file, `/* @jsx h */`, and import the `c` and `render` functions: `import {h, render} from './nori/C';`. 

Write JSX as you normally would with the following differences from React:

- Fragments are not supported
- Use `class` instead of `className`
- The special props of `triggers`, `state`, and `tweens` follow the syntax above. All other will be applied to the resulting DOM element. 

To render the component tree to the DOM, call `render` with the parent component and target DOM node.

    /* @jsx h */
    import {h, render} from './nori/C';
    let world = <h1>Hello!</h1>;
    render(world, document.querySelector('#app'));

Use the `render()` method to return a more detailed view w/ interactivity, etc. Otherwise what ever you put in between the tags (children) will be returned.

### Lifecycle hooks

The triggers for removing and updating will not fire if you place them on the parent component returned from the `render()` method. To work around this, you may use the `componentDidMount`, `componentWillUpdate`, `compontentDidUpdate`, and `componentWillUnmout` hooks.   

