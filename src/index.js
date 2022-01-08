/* Place styles up here so they can be overridden by plugin and page styles if need be */
import "chartiq/css/normalize.css";
import "chartiq/css/page-defaults.css";
import "chartiq/css/stx-chart.css";
import "chartiq/css/chartiq.scss";
/* Support for webcomponents on Legacy Edge */
import "chartiq/js/thirdparty/custom-elements.min.js";
import { CIQ } from "chartiq/js/chartiq";
// import "./importActivation.js"; /* activates modules when using license-generated bundles such as standard.js */
// import "./importActivationAdvanced.js"; /* activates advanced modules */

/* Uncomment to enable the deprecated functions.  Update your calls to functions in here to employ current usage. */
//import "chartiq/js/deprecated";

/* Uncomment to enable these plugins */
//import "chartiq/examples/feeds/L2_simulator"; /* for use with activetrader sample */
//import "chartiq/plugins/activetrader/cryptoiq";
//import "chartiq/plugins/analystviews/components";
//import "chartiq/plugins/scriptiq/scriptiq";
//import "chartiq/plugins/technicalinsights/components";
//import "chartiq/plugins/tfc/tfc-loader";
//import "chartiq/plugins/tfc/tfc-demo"; /* if using demo account class */
//import "chartiq/plugins/timespanevent/timespanevent";
//import "chartiq/plugins/timespanevent/examples/timeSpanEventSample"; /* if using sample */
//import "chartiq/plugins/visualearnings/visualearnings";
/* end plugins */

import getDefaultConfig from "chartiq/js/defaultConfiguration";
//import "chartiq/examples/help/helpContent";
import PerfectScrollbar from "chartiq/js/thirdparty/perfect-scrollbar.esm";
// import quotefeed from "chartiq/examples/feeds/quoteFeedSimulator";
import "chartiq/examples/feeds/symbolLookupChartIQ";
import "chartiq/examples/markets/marketDefinitionsSample";
import "chartiq/examples/markets/marketSymbologySample";
import marker from "chartiq/examples/markers/markersSample";

import "chartiq/examples/markers/tradeAnalyticsSample";
import "chartiq/examples/markers/videoSample";
import "chartiq/examples/translations/translationSample";

/* Add to use the option chain simulator for option-based functionality (such as optionVolumeByStrike study).
 	Then use optionfeed instead of quotefeed in the object parameter for getDefaultConfig. */
// import optionfeed from "chartiq/examples/feeds/optionChainSimulator";
/* Remove if not using the forecasting simulator (required for the forecasting sample). */
import forecastfeed from "chartiq/examples/feeds/quoteFeedForecastSimulator";

// import {createChart} from "chartiq/examples/templates/js/sample-template";
import { fetchScripInfo } from './services/backendAPI';
import queryString from 'query-string';
import { createChart } from './chartiqIntegration/template';
import octopusInstance from './services/octopus/octopusInstance';
import {getQuoteFeed} from './chartiqIntegration/quotefeed';

function hideExtraElements() {
  // $('cq-lookup').css('display', 'none');  
  $('cq-comparison').css('display', 'none');
  $('.stx-markers').css('display', 'none');
}


function loadChart() {
  let { exchange, instrument_token, login_id, auth_token, device, fullscreen,color, theme } = queryString.parse(location.search);
  if (!exchange ||
      !instrument_token ||
      !login_id ||
      !auth_token ||
      !device ||
      !fullscreen
    ) return;

  fullscreen = fullscreen === "true" || CIQ.isMobile;
  // console.log(CIQ.isMobile);
  if(CIQ.isMobile)
    $('.stx-trade').css('display', 'none');

  instrument_token = parseInt(instrument_token);
  
  sessionStorage.setItem('login_id', login_id);
  sessionStorage.setItem('auth_token', auth_token);
  sessionStorage.setItem('device', device);
  sessionStorage.setItem('instrument_token', instrument_token);

  if(fullscreen === true) {
    $("#chart-popout").css("display", "none");
  } else {
    $("#chart-popout").click(() => {
      // location.search.fullscreen = true;
      // $("#chart-popout").css("display", "none");
      const qs = queryString.stringify({
        auth_token: sessionStorage.getItem("auth_token"),
        device: device,
        login_id: sessionStorage.getItem("login_id"),
        exchange: sessionStorage.getItem("exchange"),
        instrument_token: sessionStorage.getItem("instrument_token"),
        fullscreen: true,
        theme: theme,
        color: color
      });
      const chartUrl = `/chartiq/?${qs}`;
      // var newLocSearch = location.search.replace("fullscreen=false", "fullscreen=true");
      // var chartUrl = location.pathname + newLocSearch;
      window.open(chartUrl);
    });
  }
 
  octopusInstance.connect();
  
  fetchScripInfo(exchange, instrument_token)
    .then(({ result }) => {
      // console.log(result);
      const initialSymbol = {
        symbol: result.trading_symbol,
        name: result.company_name,
        exchDisp: exchange,
        is_index: result.is_index,
      };
      const paramInput = {
        extendedHours: true,
        forecasting: false,
        marketDepth: true,
        rangeSlider: true,
        inactivityTimer: true,
        continuousZoom: false,
        animation: false,
        tooltip: false,
        fullScreen: fullscreen,
        theme: theme === 'light' ? 'ciq-day' : 'ciq-night',
        outliers: false,
        initialSymbol,
      };
      sessionStorage.setItem('lot_size', result.board_lot_quantity);
      sessionStorage.setItem('tick_size', result.tick_size);
      sessionStorage.setItem('exchange', exchange);
      sessionStorage.setItem('trading_symbol', result.trading_symbol);

      const config = getDefaultConfig({
        markerSample: marker.MarkersSample,
        scrollStyle: PerfectScrollbar,
        quoteFeed: getQuoteFeed(exchange, instrument_token),
        forecastQuoteFeed: forecastfeed
      });

      config.initialSymbol = initialSymbol;
      console.log(config)
      // Load the chart
      let stx = config.createChart();

      // setTimeout(()=>{
      //   stx.chart.container.style.background=color;
      // },1500)
      $('#chart-refresh').click(() => {
        console.log(window.location.search);
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set("exchange", sessionStorage.getItem('exchange'));
        searchParams.set("instrument_token", sessionStorage.getItem('instrument_token'));
        window.location.search = searchParams.toString();
        console.log(searchParams.toString());
        // location.reload();
        // stx.home({whitespace:0});
      })
      setTimeout(hideExtraElements, 100);
    })
    .catch(err => {
      console.log(err);
    });
   }

loadChart();
