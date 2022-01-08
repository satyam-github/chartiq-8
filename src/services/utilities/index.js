import { getExchangeMultiplier } from './exchanges';

export function piserverDataToChartiqQuotes({ candles = [] }) {
  return candles.map((candle) => {
    return {
      DT: new Date(candle[0]),
      Open: candle[1],
      High: candle[2],
      Low: candle[3],
      Close: candle[4],
      Volume: candle[5],
    };
  });
}

export function elixirChartsToChartiqQuotes(candles, exchange) {
  const divisor = getExchangeMultiplier(exchange);
  return candles.map((candle) => {
    return {
      DT: new Date(candle[0] * 1000),
      Open: candle[1] / divisor,
      High: candle[2] / divisor,
      Low: candle[3] / divisor,
      Close: candle[4] / divisor,
      Volume: candle[5],
    };
  });
}