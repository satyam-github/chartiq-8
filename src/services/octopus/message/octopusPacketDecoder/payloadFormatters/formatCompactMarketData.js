import { getExchangeMultiplier } from '../../../../utilities/exchanges';

function formatCompactMarketData({
  exchange,
  instrumentToken,
  ltp,
  change,
  ltt,
  lowDpr,
  highDpr,
  currentOpenInterest,
  initialOpenInterest,
  bidPrice,
  askPrice,
}) {
  const divisor = getExchangeMultiplier(exchange);
  const absoluteChange = change / divisor;
  const formattedLtp = ltp / divisor;
  const percentChange = ((absoluteChange * 100) / (formattedLtp - absoluteChange)) || 0;
  return {
    exchange,
    instrumentToken,
    ltp: formattedLtp,
    absoluteChange,
    percentChange,
    ltt,
    lowDpr: lowDpr / divisor,
    highDpr: highDpr / divisor,
    currentOpenInterest,
    initialOpenInterest,
    bidPrice: bidPrice / divisor,
    askPrice: askPrice / divisor,
  }
}

export default formatCompactMarketData;
