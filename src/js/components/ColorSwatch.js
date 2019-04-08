/* @jsx h */

/**
 * Shamelessly pulled from https://youtu.be/_MAD4Oly9yg?t=348
 */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";

export default class ColorSwatch extends NoriComponent {

  // Subclasses should only take passed props and children
  constructor(props) {
    super(props);
    this.intervalId = null;
    this.state      = {counter: 1};
  }

  componentDidMount = () => {
    this.intervalId = setInterval(this.$updateTicker, 100)
  };

  $updateTicker = _ => {
    this.state = {counter: (this.state.counter + 15)}
  };

  componentDidUpdate = () => {
  };

  componentWillUnmount = () => {
    clearInterval(this.intervalId);
  };

  render() {
    const colVal = this.state.counter % 256;
    return (<div
      style={{
        backgroundColor: `rgb(0, 0, ${colVal})`,
        overflow       : 'hidden',
        borderRadius   : '25%',
        height         : '50px',
        width          : '50px',
      }}
    />);
  }
}