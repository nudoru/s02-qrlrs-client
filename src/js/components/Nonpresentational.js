/* @jsx h */

import NoriComponent from '../nori/NoriComponent';
import {h} from "../nori/Nori";

export default class Nonpresentational extends NoriComponent {

  // Subclasses should only take passed props and children
  constructor(props) {
    super(props);
    console.log('NonPresentational construct');
  }

  componentDidMount   = () => {
    console.log('NonPresentational did mount');
  };

  componentWillUnmount = () => {
    console.log('NonPresentational will remove');
  };

  componentWillUpdate  = () => {
    console.log('NonPresentational will update');
  };

  componentDidUpdate   = () => {
    console.log('NonPresentational did update');
  };

}