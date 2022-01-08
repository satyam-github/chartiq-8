import hydraTopicConfig from './hydra-topic-config.json';
import Logger from './logger';


export const modeStringToModeCode =
  Object.entries(hydraTopicConfig)
  .reduce((acc, [_messageType, { mode, code }]) => {
    return { ...acc, [mode]: code };
  }, {});


export const modeCodeToModeString =
  Object.entries(modeStringToModeCode)
  .reduce((acc, [modeString, modeCode]) => {
    return { ...acc, [modeCode]: modeString };
  }, {});


export function getSubscriptionTopic({ messageType, payload = {} }) {
  if (!(messageType in hydraTopicConfig)) {
    throw `${messageType} not supported`;
  }

  const privateMessageTypes = ['ClientAlerts', 'OrderUpdate', 'TradeUpdate', 'AdminMessage'];
  if (privateMessageTypes.includes(messageType)) {
    return `${messageType}`;
  }

  // const { mode, code } = hydraTopicConfig[messageType];
  const instrumentUpdates = ['DetailMarketDataMessage', 'CompactMarketDataMessage', 'SnapquoteDataMessage', 'SpreadMarketUpdate', 'TbtUpdate'];
  if (instrumentUpdates.includes(messageType)) {
    const { exchangeCode, instrumentToken } = payload;
    if (!exchangeCode || !instrumentToken) {
      throw `missing exchangeCode: ${exchangeCode} or instrumentToken: ${instrumentToken}`;
    }
    return `${messageType}/${exchangeCode}/${instrumentToken}`;
  }

  const exchangeUpdates = ['MktStatus', 'ExchangeMessage'];
  if (exchangeUpdates.includes(messageType)) {
    const { exchangeCode } = payload;
    if (!exchangeCode) {
      throw `missing exchangeCode: ${exchangeCode}`;
    }
    return `${messageType}/${exchangeCode}`;
  }

  throw `invalid messageType: ${messageType}`;
}

// supported actionType: subscribe, unsubscribe
export function getSocketPublishObject({ messageType, actionType, payload = {} }) {
  switch (messageType) {
    case 'CompactMarketDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'compact_marketdata'
      };
    case 'DetailMarketDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'marketdata'
      };
    case 'SnapquoteDataMessage':
      return {
        a: actionType,
        v: [[payload.exchangeCode, payload.instrumentToken]],
        m: 'full_snapquote'
      };
    case 'OrderUpdate':
      return {
        a: actionType,
        v: [sessionStorage.getItem('login_id'), "web"],
        m: 'updates'
      }
    case 'ExchangeMessage':
      return {
        a: actionType,
        v: [payload.exchangeCode],
        m: 'exchange_messages'
      }
    default:
      return {};
  }
}
