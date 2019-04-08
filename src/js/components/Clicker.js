import Component from './nori/Component';

//import {useState} from "./nori/C";

/*
Testing stuff for Greeter ...



  // let test = <p class={blue}>Hi, <Greeter triggers={{
  //   click: _onClick,
  //   render: _onRender,
  //   update: _onUpdate,
  // }}>There</Greeter></p>;

 */

export default class Clicker extends Component {

  // Default state
  internalState = {count: 0};

  // Subclasses should only take passed props and children
  constructor(props) {
    // call super and pass what's needed
    //let [greeting, setGreet] = useState('Hello, <em>{{name}}!</em>');
    super(props);
  }

  $onClick = evt => {
    //console.log('greet!',evt);
    evt.component.state = {name:Lorem.firstLastName()};
  };

  $onRender = evt => {
    //console.log('greet rendered!', evt);
  };

  $onUpdate = evt => {
    //console.log('greet update!', evt.component.state);
  };

  render() {
    console.log('Clicker render!');
    return <p>Clicker counter: {++this.internalState.count}</p>
  }

}