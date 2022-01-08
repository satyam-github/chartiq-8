import Logger from '../logger';
import {
    compactMarketData,
    snapquoteData,
    marketStatus,
    exchangeMessage,
    updates,
    detailedMarketData
} from './octopusPacketDecoder';
import {
    formatCompactMarketData,
    formatSnapquoteData,
    formatDetailedMarketData
} from './octopusPacketDecoder/payloadFormatters';

export function decodeMessage(buffer) {
  const dataview = new DataView(buffer);
  const mode = dataview.getInt8(0);
  let msg = {};
  let topic = '';
  switch (mode) {
    case 1:  // marketdata
      msg = detailedMarketData(dataview) || {};
      topic = `DetailMarketDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatDetailedMarketData(msg) };

    case 2:  // compact_marketdata
      msg = compactMarketData(dataview) || {};
      topic = `CompactMarketDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatCompactMarketData(msg) };

    case 4:  // full snapquote
      msg = snapquoteData(dataview) || {};
      topic = `SnapquoteDataMessage/${msg.exchange}/${msg.instrumentToken}`;
      return { topic, msg: formatSnapquoteData(msg) };

    case 9:  // market status
      msg = marketStatus(dataview) || {};
      topic = `MktStatus/${msg.exchange}`;
      return { topic, msg };

    case 10:  // exchange_messages
      msg = exchangeMessage(dataview) || {};
      topic = `ExchangeMessage/${msg.exchange}`;
      return { topic, msg };

    case 50:  // order update
      msg = updates(dataview) || {};
      topic = 'OrderUpdate';
      return { topic, msg };

    case 51:  // trade update

    default:
      return {};
  }
}
