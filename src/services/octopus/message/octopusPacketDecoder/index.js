
DataView.prototype.getString = function(offset, length){
  var end = typeof length == 'number' ? offset + length : this.byteLength;
  var text = '';
  var val = -1;

  while (offset < this.byteLength && offset < end){
      val = this.getUint8(offset++);
      if (val == 0) break;
      text += String.fromCharCode(val);
  }

  return text;
};

DataView.prototype.getInt64 = function(byteOffset) {
  const left =  this.getUint32(byteOffset);
  const right = this.getUint32(byteOffset+4);

  const combined = 2**32*left + right;

  if (!Number.isSafeInteger(combined)) {
    console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost');
    return -1;
  }

  return combined;
}

export function compactMarketData(dataview) {
  return {
    exchange: dataview.getInt8(1),
    instrumentToken: dataview.getInt32(2),
    ltp: dataview.getInt32(6),
    change: dataview.getInt32(10),
    ltt: dataview.getInt32(14),
    lowDpr: dataview.getInt32(18),
    highDpr: dataview.getInt32(22),
    currentOpenInterest: dataview.getInt32(26),
    initialOpenInterest: dataview.getInt32(30),
    bidPrice: dataview.getInt32(34),
    askPrice: dataview.getInt32(38),
  };
}

export function detailedMarketData(dataview) {
  return {
    exchange: dataview.getInt8(1),
    instrumentToken: dataview.getInt32(2),
    lastTradedPrice: dataview.getInt32(6),
    lastTradedTime: dataview.getInt32(10),
    lastTradedQuantity: dataview.getInt32(14),
    volume: dataview.getInt32(18),
    bestBidPrice: dataview.getInt32(22),
    bestBidQuantity: dataview.getInt32(26),
    bestAskPrice: dataview.getInt32(30),
    bestAskQuantity: dataview.getInt32(34),
    totalBuyQuantity: dataview.getInt64(38),
    totalSellQuantity: dataview.getInt64(46),
    averageTradePrice: dataview.getInt32(54),
    exchangeTimestamp: dataview.getInt32(58),
    openPrice: dataview.getInt32(62),
    highPrice: dataview.getInt32(66),
    lowPrice: dataview.getInt32(70),
    closePrice: dataview.getInt32(74),
    yearlyHighPrice: dataview.getInt32(78),
    yearlyLowPrice: dataview.getInt32(82),
    lowDPR: dataview.getInt32(86),
    HighDPR: dataview.getInt32(90),
    currentOpenInterest: dataview.getInt32(94),
    initialOpenInterest: dataview.getInt32(98),
  }
}

export function snapquoteData(dataview) {
  return {
    exchange: dataview.getInt8(1),
    instrumentToken: dataview.getInt32(2),
    buyers: [dataview.getInt32(6), dataview.getInt32(10), dataview.getInt32(14), dataview.getInt32(18), dataview.getInt32(22)],
    bidPrices: [dataview.getInt32(26), dataview.getInt32(30), dataview.getInt32(34), dataview.getInt32(38), dataview.getInt32(42)],
    bidQtys: [dataview.getInt32(46), dataview.getInt32(50), dataview.getInt32(54), dataview.getInt32(58), dataview.getInt32(62)],
    sellers: [dataview.getInt32(66), dataview.getInt32(70), dataview.getInt32(74), dataview.getInt32(78), dataview.getInt32(82)],
    askPrices: [dataview.getInt32(86), dataview.getInt32(90), dataview.getInt32(94), dataview.getInt32(98), dataview.getInt32(102)],
    askQtys: [dataview.getInt32(106), dataview.getInt32(110), dataview.getInt32(114), dataview.getInt32(118), dataview.getInt32(122)],
    averageTradePrice: dataview.getInt32(126),
    open: dataview.getInt32(130),
    high: dataview.getInt32(134),
    low: dataview.getInt32(138),
    close: dataview.getInt32(142),
    totalBuyQty: dataview.getInt64(146),
    totalSellQty: dataview.getInt64(154),
    volume: dataview.getInt32(162),
  };
}

export function marketStatus(dataview) {
  const exchange = dataview.getInt8(1);
  const marketTypeLength = dataview.getInt16(2);
  const marketType = dataview.getString(4, marketTypeLength);
  const marketTypeEnd = 4 + marketTypeLength;
  const messageLength = dataview.getInt16(marketTypeEnd);
  const messageStart = marketTypeEnd + 2;
  const message = dataview.getString(messageStart, messageLength);
  const messageEnd = messageStart + messageLength;
  const timestamp = dataview.getInt32(messageEnd);
  return {
    exchange,
    marketType,
    message,
    timestamp,
  };
}

export function exchangeMessage(dataview) {
  const exchange = dataview.getInt8(1);
  const messageLength = dataview.getInt16(2);
  const message = dataview.getString(4, messageLength);
  const messageEnd = 4 + messageLength;
  const timestamp = dataview.getInt32(messageEnd);
  return {
    exchange,
    message,
    timestamp,
  };
}

export function updates(dataview) {
  const stringifiedUpdate = dataview.getString(5) || '{}';
  return JSON.parse(stringifiedUpdate);
}
