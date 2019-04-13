/* @jsx h */

import {h} from "../nori/Nori";
import {useEffect, useState} from "../nori/Hooks";
import {QrReader} from "../components/QrReader";
import Lister from '../components/Lister';
import {getLRSAuthToken} from '../learningservices/shared';
import {sendStatement} from '../learningservices/lrs/LRS';
import {capitalizeFirstLetter} from '../nori/util/StringUtils';
import {css} from 'emotion';
import {theme} from '../theme/Theme';

const absoluteCenter = css`
  display: grid;
  height: 100vh;
  margin: 0;
  place-items: center;
  background-image: ${theme.gradients["saint-petersburg"]};
`;

const bigButton = css`
  cursor: pointer;
  display: inline-block;
  padding: 20px;
  border: none;
  border-radius: 5px;
  background-image: ${theme.gradients["tempting-azue"]};
  box-shadow: inset 0 -5px 0 rgba(0,0,0,.25);
`;

const pictureFrame = css`
  border: solid 25px #fff;
  background: #fff;
  box-shadow: ${theme.shadows.dropShadow.xl};
  border-radius: 25px;
  overflow: hidden;
`;

const successStyle = css`
  display: grid;
  place-items: center;
  height: 75%;
  width: 75%;
  background: #fff;
  border-radius: 25px;
  box-shadow: ${theme.shadows.dropShadow.xl};
`;

const ACTOR = {
  actor: {
    name      : "Matt Perkins",
    mbox      : "mailto:hello@mattperkins.me",
    objectType: "Agent"
  }
};

// Free Watershed Essentials account I created
const LRS_CONNECTION = {
  statementendpoint: "https://watershedlrs.com/api/organizations/7493/lrs/statements",
  authendpoint     : "https://watershedlrs.com/api/organizations/7493/oauth2/token",
  token            : "",
  key              : "3a9bbc9ad8dd39",
  secret           : "eaf5a4c46d1f9f",
  version          : "1.0.0"
};

let fullStatement = {},
    lrsToken      = null;

export const ReaderPage = props => {

  let [statementSent, setStatementSent] = useState(false),
      [doReload, setDoReload] = useState(false);

  useEffect(() => {
    getLRSAuthToken(LRS_CONNECTION).fork(e => {
      console.warn('error getting token', e);
    }, s => {
      lrsToken = s;
      console.log('Got token from the LRS');
    });

    // setTimeout(() => {
    //   setStatementSent(true);
    // }, 1000)
  }, []);

  const onErrorFn = (err, data) => {
    console.warn(`Didn't read the code`, err, data);
  };

  const onReadFn = (data) => {
    console.log(`Read code : `, data);
    fullStatement = Object.assign({}, ACTOR, data);
    sendCodeStatement();
  };

  const sendCodeStatement = _ => {
    if (lrsToken === null) {
      console.warn(`Can't send statement, don't have a token!`);
      return;
    } else if (statementSent) {
      console.log('The statement has already been sent!');
      return;
    }

    console.log(`Sending statement: `, fullStatement);

    sendStatement({
      endpoint : LRS_CONNECTION.statementendpoint,
      tokentype: capitalizeFirstLetter(lrsToken.token_type),
      token    : lrsToken.access_token,
      version  : "1.0.0"
    }, fullStatement).fork(console.warn, success => {
      console.log(`Statement successfully sent! `, success);
    });

    setStatementSent(true);
  };

  const onResetClick = e => {
    console.log('reset to allow new statements to be sent');
    setStatementSent(false);
  };

  let scannerContents = <div>
    <h3>Scan a code</h3>
    <div
      className={pictureFrame}>
      <QrReader onReadCallback={onReadFn} onErrorCallback={onErrorFn}/>
      {/*<p>Hi!</p>*/}
    </div>
  </div>;

  let scannedContents = <div className={successStyle}>
    <h3>Successfully Scanned!</h3>
    <button onClick={onResetClick} className={bigButton}>Scan another one</button>
    <p>{JSON.stringify(fullStatement)}</p>
  </div>;

  let contents = statementSent ? scannedContents : scannerContents;

  const onReloadClick = _ =>{
    // console.log('     !!!! reload clicked', doReload, !doReload);
    setDoReload(!doReload);
  };

  // console.log('     !!!! RELOAD', doReload);

  return <div className={absoluteCenter}>
    {contents}
  </div>;
};