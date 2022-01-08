import { piserverDataToChartiqQuotes, elixirChartsToChartiqQuotes } from '../services/utilities';
import { fetchChartData } from '../services/backendAPI';
import octopusInstance from '../services/octopus/octopusInstance';
import { getExchangeCode } from '../services/utilities/exchanges';

// possible values PISERVER, ELIXIR_CHARTS
const chartBackend = 'ELIXIR_CHARTS';

const formatChartData =
  chartBackend === 'PISERVER'
  ?
  piserverDataToChartiqQuotes
  :
  (candles, exchange) => elixirChartsToChartiqQuotes(candles, exchange);

export function getQuoteFeed(exchange, token) {
  console.log(exchange, token)
  const getCandleType = ({ interval, period }) => {
    if (interval === 'day') return 3;
    if (period === 60) return 2;
    if (interval === 'minute') return 1;
    return 0;
  }

  const getParamsForRequest = (startDate, endDate, params, dataCategory) => {
    return {
      exchange: params.symbolObject.is_index ? params.symbolObject.exchDisp+"_INDICES" : params.symbolObject.exchDisp,
      token: params.symbolObject.token ? params.symbolObject.token : token,
      name: params.symbol,
      candletype: getCandleType(params),
      starttime: parseInt(startDate.getTime() / 1000),
      endtime: parseInt(endDate.getTime() / 1000),
      type: dataCategory,
      data_duration: params.period === 60 ? 1 : params.period,
    };
  };

  const loadData = (params, cb) => {
    let moreAvailableFlag = true;
    fetchChartData(params)
      .then(({ data }) => {
        // console.log(data);
        // if(params.type === 'historical') {
        //   if(params.candletype === 3 && data.length < 1)
        //     moreAvailableFlag = false;
        //   else if(data.length < 10)
        //     moreAvailableFlag = false; 
        // }
        if(params.candletype === 3 && data.length < 1)
          moreAvailableFlag = false;
        else if(data.length < 10)
          moreAvailableFlag = false;
        const quotes = formatChartData(data, params.exchange);
        cb({ quotes, moreAvailable: moreAvailableFlag });
      })
      .catch((error) => {
        cb({ error });
      });
  }

  let wsHandler;

  return {
    maxTicks: 2000,
    fetchInitialData: (symbol, startDate, endDate, params, cb) => {
      const currentDate = new Date();
      // const hours = currentDate.getHours();
      // const minutes = currentDate.getMinutes();
      // const day = currentDate.getDay();
      currentDate.setHours(0,0,0,0);
      // const timestampMilliseconds = currentDate.getTime();
      // console.log(hours, minutes, day);
      const candleType = getCandleType(params);
      if (candleType === 1) {
        if (params.period === 1 || params.period === 2)
          startDate = new Date(endDate - (5 * 24 * 3600 * 1000));
        else
          startDate = new Date(endDate - (30 * 24 * 3600 * 1000));
      }
      let requestParams;
      requestParams = getParamsForRequest(startDate, endDate, params, 'all');
      // const exchange = params.symbolObject.exchDisp;
      // if(day === 0 || day === 6) {
      //   startDate = new Date(timestampMilliseconds - (30 * 24 * 3600 * 1000));
      //   requestParams = getParamsForRequest(startDate, endDate, params, 'historical');
      // } else {
      //   switch(hours) {
      //     case 6, 7, 8:
      //       startDate = new Date(timestampMilliseconds - (30 * 24 * 3600 * 1000));
      //       requestParams = getParamsForRequest(startDate, endDate, params, 'historical');
      //       break;
      //     case 9:
      //       if(exchange === 'MCX' || exchange === 'CDS') {
      //         startDate = new Date(timestampMilliseconds - (30 * 24 * 3600 * 1000));
      //         requestParams = getParamsForRequest(startDate, endDate, params, 'live');
      //       } else if(minutes < 15) {
      //         startDate = new Date(timestampMilliseconds - (30 * 24 * 3600 * 1000));
      //         requestParams = getParamsForRequest(startDate, endDate, params, 'historical');
      //       } else {
      //         startDate = new Date(timestampMilliseconds - (30 * 24 * 3600 * 1000));
      //         requestParams = getParamsForRequest(startDate, endDate, params, 'live');
      //       }
      //       break;
      //     default:
      //       startDate = new Date(timestampMilliseconds - (12 * 24 * 3600 * 1000));
      //         // console.log("hello", startDate, endDate);
      //       requestParams = getParamsForRequest(startDate, endDate, params, 'live');
      //   }
      // }
      // console.log(startDate, endDate);
      loadData(requestParams, cb);
    },
    fetchPaginationData: (symbol, startDate, endDate, params, cb) => {
      // const candleType = getCandleType(params);
      // console.log(candleType);
      // if(candleType === 3)
      //   startDate = new Date(endDate - (5 * 12 * 30 * 24 * 3600 * 1000));  
      // else if (candleType === 2)
      //   startDate = new Date(endDate - (6 * 30 * 24 * 3600 * 1000));  
      // else 
      //   startDate = new Date(endDate - (30 * 24 * 3600 * 1000));
      // console.log(startDate, endDate);
      const requestParams = getParamsForRequest(startDate, endDate, params, 'all');
      loadData(requestParams, cb);
    },
    subscribe: (params) => {
      // console.log(params);
      const { stx, symbol, symbolObject, period, interval } = params;
      // console.log(period, interval);
      const instrumentToken = symbolObject.token ? symbolObject.token : token;
      const exchDisp = symbolObject.exchDisp ? symbolObject.exchDisp : exchange;

      wsHandler = octopusInstance.wsHandler({
        messageType: 'DetailMarketDataMessage',
        subscriptionLocation: `chartiq-${exchDisp}-${instrumentToken}`,
        payload: {
          exchangeCode: getExchangeCode(exchDisp),
          instrumentToken: instrumentToken,
        }
      });

      let prevVolume = 0;
      let netVolume = 0;
      let currVolume = 0;
      let isVisited = false;
      wsHandler.subscribe(({ msg }) => {
        if(!isVisited) {
          prevVolume = msg.volume;
          isVisited = true;
        }
        currVolume = msg.volume;
        netVolume = (currVolume - prevVolume);
        // console.log(netVolume);
        const quote = {
          DT: new Date(msg.exchangeTimestamp * 1000),
          Close: msg.lastTradedPrice,
          Volume: netVolume,
        };
        prevVolume = currVolume;
        stx.updateChartData(quote, null, {
          fillGaps: true,
          useAsLastSale: true
        });
      });
    },
    unsubscribe: ({ stx, symbol, symbolObject, period, interval }) => {
      wsHandler.unsubscribe();
    }
  };
}
