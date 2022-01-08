import { getExchangeMultiplier } from '../../../../utilities/exchanges';

function formatSnapquoteData({
  exchange,
  instrumentToken,
  buyers,
  bidPrices,
  bidQtys,
  sellers,
  askPrices,
  askQtys,
  averageTradePrice,
  open,
  high,
  low,
  close,
  totalBuyQty,
  totalSellQty,
  volume,
}) {
  const divisor = getExchangeMultiplier(exchange);
  return {
    exchange,
    instrumentToken,
    buyers: buyers,
    bidPrices: bidPrices.map(value => value / divisor),
    bidQtys,
    sellers,
    askPrices: askPrices.map(value => value / divisor),
    askQtys,
    averageTradePrice: averageTradePrice / divisor,
    open: open / divisor,
    high: high / divisor,
    low: low / divisor,
    close: close / divisor,
    totalBuyQty,
    totalSellQty,
    volume,
  }
}

export default formatSnapquoteData;
