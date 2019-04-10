/* @jsx h */

import {h} from "../nori/Nori";
import {useEffect} from "../nori/Hooks";
import {QrReader} from "../components/QrReader";
import {getLRSAuthToken} from '../learningservices/shared';
import {sendStatement} from '../learningservices/lrs/LRS';
import {capitalizeFirstLetter} from '../nori/util/StringUtils';

const ACTOR = {
  actor: {
    name: "Matt Perkins",
    mbox: "mailto:hello@mattperkins.me",
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


export const ReaderPage = props => {

  let fullStatement = {},
      lrsToken      = null,
      statementSent = false;

  useEffect(() => {
    getLRSAuthToken(LRS_CONNECTION).fork(e => {
      console.warn('error getting token', e);
    }, s => {
      lrsToken = s;
      console.log('Got token from the LRS');
    });
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
    } else if(statementSent) {
      console.log('The statement has already been sent!');
      return;
    }

    statementSent = true;
    console.log(`Sending statement: `,fullStatement);

    sendStatement({
      endpoint : LRS_CONNECTION.statementendpoint,
      tokentype: capitalizeFirstLetter(lrsToken.token_type),
      token    : lrsToken.access_token,
      version  : "1.0.0"
    }, fullStatement).fork(console.warn, success => {
      console.log(`Statement successfully sent! `, success);
    });
  };

  return <QrReader onReadCallback={onReadFn} onErrorCallback={onErrorFn}/>;
};