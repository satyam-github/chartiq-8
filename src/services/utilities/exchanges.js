const exchangeMultiplierMap = {
  NSE: 100,
  NFO: 100,
  CDS: 10000000,
  MCX: 100,
  BSE: 100,
  BFO: 100,
  NSE_INDICES: 100,
  BSE_INDICES: 100
};

const exchangeNameToCode = {
  NSE: 1,
  NFO: 2,
  CDS: 3,
  MCX: 4,
  BSE: 6,
  BFO: 7,
};

const exchangeCodeToName = {
  1: 'NSE',
  2: 'NFO',
  3: 'CDS',
  4: 'MCX',
  6: 'BSE',
  7: 'BFO',
};

export function getExchangeName(exchangeCode) {
  return exchangeCodeToName[exchangeCode];
}

export function getExchangeCode(exchangeName) {
  return exchangeNameToCode[exchangeName];
}

export function getExchangeMultiplier(exchange) {
  if (typeof exchange === 'number') {
    exchange = getExchangeName(exchange);
  }
  if (!(exchange in exchangeMultiplierMap)) {
    throw new Error(`exchange ${exchange} not supported`);
  }
  return exchangeMultiplierMap[exchange];
}