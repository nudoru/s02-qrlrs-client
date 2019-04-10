/* @jsx h */

import {h} from './nori/Nori';
import {render} from './nori/NoriDOM';
import {ReaderPage} from "./pages/ReaderPage";

import Theme from './theme/Global';

render(<ReaderPage/>, document.querySelector('#js-application'));
