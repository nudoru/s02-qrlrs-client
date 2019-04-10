/* @jsx h */

import {h} from "../nori/Nori";
import {QrReader} from "../components/QrReader";

export const ReaderPage = props => {

  const onErrorFn = (err, data) => {
    console.warn(`Didn't read the code`,err,data);
  };
  const onReadFn = (data) => {
    console.log(`I see the code!`,data);
  };

  return <QrReader onReadCallback={onReadFn} onErrorCallback={onErrorFn}/>;
};