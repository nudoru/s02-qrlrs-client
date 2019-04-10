/* @jsx h */

import {h} from './nori/Nori';
import {render} from './nori/NoriDOM';
import {ReaderPage} from "./pages/ReaderPage";
import {QrReader} from "./components/QrReader";

import Theme from './theme/Global';

// render(<ReaderPage/>, document.querySelector('#js-application'));
render(<ReaderPage/>, document.querySelector('#js-application'));
