/* @jsx h */

import {h} from './nori/Nori';
import {render} from './nori/NoriDOM';
import QrReader from "./pages/QrReader";


render(<QrReader/>, document.querySelector('#js-application'));
