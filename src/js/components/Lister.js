/* @jsx h */

/**
 * Example component that supports lifecycle hooks and state updating
 */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";
import {useState, useEffect} from "../nori/Hooks";
import {css} from 'emotion';
import {modularScale} from "../theme/Theme";
import {range} from "../nori/util/ArrayUtils";
import Greeter from './Greeter';

const bordered = css`
border: 1px solid #ccc;
background-color: #eee;
padding: ${modularScale.ms0}
`;

export default class Lister extends NoriComponent {

  // Subclasses should only take passed props and children
  constructor(props) {
    super(props);
    this.state = {counter: 1};
  }

  componentDidMount = () => {
    //console.log('Ticker did mount');
  };

  componentDidUpdate = () => {
    // console.log('Lister update', this.state);
  };

  componentWillUnmount = () => {
    //console.log('Lister will unmount');
  };

  $onAddClick = e => {
    this.state = {counter: ++this.state.counter}
  };

  $onRemoveClick = e => {
    let current = this.state.counter;
    if (current < 2) {
      return;
    }
    this.state = {counter: --current}
  };

  render() {
    //console.log('render lister');

    return <div className={bordered} key={this.props.id}>
      <button onClick={this.$onAddClick}>Add</button>
      <button onClick={this.$onRemoveClick}>Remove</button>
      <hr/>
      <span>
      {range(this.state.counter).map(i => {
        return <Greeter key={'listitem-' + i}/>;
      })}
      </span>
      <hr/>
      <span>
      {() => (range(this.state.counter).map(i => {
        return <Greeter key={'listitem-2' + i}/>;
      }))}
      </span>
    </div>;
  }
}