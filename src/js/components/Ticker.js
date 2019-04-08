/* @jsx h */

/**
 * Example component that supports lifecycle hooks and state updating
 */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";
import {css} from 'emotion';

const red = css`color: red;`;

export default class Ticker extends NoriComponent {

  // Subclasses should only take passed props and children
  constructor(props) {
    super(props);
    this.intervalID = null;
    this.state      = {counter: 1};
    // console.log(`${this.props.id} TICKER : constructor`);
  }

  componentDidMount = () => {
    this.intervalID = setInterval(this.$updateTicker, 1000)
  };

  $updateTicker = _ => {
    //console.log('Ticker update!', this.props.id, this.current);
    this.state = {counter: ++this.state.counter}
  };

  componentDidUpdate = () => {
    //console.log('Ticker update', this.state);
  };

  componentWillUnmount = () => {
    clearInterval(this.intervalID);
  };

  render() {
    return <h3>The count is <strong className={red}>{this.state.counter}</strong> ticks.</h3>;
  }
}