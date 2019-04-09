/* @jsx h */

import {h} from './nori/Nori';
import {render} from './nori/NoriDOM';
import QrReader from "./pages/QrReader";
import Theme from './theme/Global';

render(<QrReader/>, document.querySelector('#js-application'));
