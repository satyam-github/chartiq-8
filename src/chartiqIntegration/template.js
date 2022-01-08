import { CIQ } from 'chartiq/js/chartiq';
import { getQuoteFeed } from './quotefeed';
// import { marker } from 'chartiq/examples/markers/markersSample';
import './chart-config';


function initConfig() {
  const config = CIQ.getDefaultConfig();
  config.initSymbol = {
    symbol: '***',
    name: '***',
    exchDisp: '***',
  };
  return config;
}

function chartReadyHandler(e) {
  e.detail.node.stx = createChart(
    e.detail.params,
    e.detail.callbacks,
    e.detail.node
  );
}

$("body").on("signal-chart-ready", chartReadyHandler);
$("[cq-event-flag]").each(function() {
  chartReadyHandler(this.signalEvent);
});

function configAvailable(config, root) {
  if (!(config || CIQ.getDefaultConfig)) {
    (root || document.body).innerHTML = `
    <div class="ciq-terminal-error">
      <h3>Error while instantiating chart</h3>
      <p>
      The chart configuration was not included in the paramInput argument of the 
      createChart function in sample-template.js, and the CIQ.getDefaultConfig function 
      (see the initConfig function) is not available in this version of the library.
      </p>
      <p>
      Please include the sample chart configuration by adding the following script tag to the template file:
      &lt;script src="examples/templates/js/sample-config.js"&gt;&lt;/script&gt;
      </p>
      <p>
      Add the tag before the script tag that loads sample-template.js. For example:<br>
      &lt;script src="examples/templates/js/sample-config.js"&gt;&lt;/script&gt;<br>
      &lt;script src="examples/templates/js/sample-template.js"&gt;&lt;/script&gt;
      </p>
    </div>
    `;
    return false;
  }
  return true;
}

export function createChart(paramsInput, callbacks, root) {
  if (!configAvailable(paramsInput && paramsInput.config, root)) return;
  const params = paramsInput || {
    extendedHours: true,
    forecasting: false,
    marketDepth: true,
    rangeSlider: true,
    inactivityTimer: true,
    continuousZoom: false,
    animation: false,
    tooltip: false,
    fullScreen: true,
    outliers: false
  }

  if (params.storage !== false) {
    params.storage = true;
  }
  if (!root) {
    root = document.body;
  }
 
  const config = params.config || initConfig();
 
  // transfer initial symbol and term structure and disabled addOns to config
 
  if (params.initialSymbol) config.initialSymbol = params.initialSymbol;
  if (params.termStructure) config.termStructure = params.termStructure;
  if (params.theme) config.themes.defaultTheme = params.theme;
 
  // console.log(config.addOns);
  for (let name in config.addOns) {
    if (!params[name]) {
      config.addOns[name] = null;
    }
  }
  for (let name in config.plugins) {
    if (params[name] === false) {
      config.plugins[name] = null;
    }
  }
  if(CIQ.isMobile) {
    config.plugins["tfc"] = null;
    config.addOns["fullScreen"] = null;
  }

  if (!config.chartId) config.chartId = root.id;
  config.callbacks = callbacks || {};
  const chart = new CIQ.UI.Chart();
 
  CIQ.ChartEngine.prototype.formatYAxisPrice=function(price, panel, requestedDecimalPlaces, yAxis, internationalize){
    // extra code to match floating y axis label from drawCurrentHR
    if(requestedDecimalPlaces===null || typeof requestedDecimalPlaces=="undefined") {
       var requestedDecimalPlaces=Math.max(panel.yAxis.printDecimalPlaces, panel.chart.decimalPlaces);
       if(!yAxis) yAxis = panel.yAxis;
       if(yAxis.maxDecimalPlaces || yAxis.maxDecimalPlaces===0) requestedDecimalPlaces=Math.min(requestedDecimalPlaces, yAxis.maxDecimalPlaces);
     }
 
     if(price===null || typeof price=="undefined" || isNaN(price) ) return "";
     if(!panel) panel=this.chart.panel;
     var yax=yAxis?yAxis:panel.yAxis;
     var decimalPlaces=requestedDecimalPlaces;
     if(!decimalPlaces && decimalPlaces!==0) decimalPlaces=yax.printDecimalPlaces;
     if(!decimalPlaces && decimalPlaces!==0){
       decimalPlaces=this.decimalPlacesFromPriceTick(yax.priceTick);
     }
     var minCondense=yax==panel.chart.yAxis?20000:1000;
     if(yax.priceTick>=minCondense){
       price=price.toFixed(decimalPlaces);// k or m for thousands or millions
       return CIQ.condenseInt(price);
     }
 
     var internationalizer=this.internationalizer;
     if(internationalizer && internationalize!==false){
       var l=internationalizer.priceFormatters.length;
       if(decimalPlaces>=l) decimalPlaces=l-1;
       price=internationalizer.priceFormatters[decimalPlaces].format(price);
     }else{
       price=price.toFixed(decimalPlaces);
       // the above may be a problem at some point for datasets with very small shadows because the rounding skews the real number.
       // We should truncate the decimal places instead of rounding to preserve the accuracy,
       // but for now the above seems to work fine so we will leave it alone.
       // And also the amount of rounding being done here actually "corrects" some of differences introduced elsewhere in the yAxis price calculations. ugg!
       // Use the flowing code when ready to show truncated vs. rounded values
       //price = price.toString();
       //if(price.indexOf(".") > 0){
       //	price = price.slice(0, (price.indexOf("."))+decimalPlaces+1)
       //};
     }
     return price;
   };

  const { stx } = chart.createChartAndUI({ container: root, config });

  return CIQ.ChartEngine.create({ container, config });

  // new CIQ.FullScreen({stx:stx});

  // const exchange = sessionStorage.getItem('exchange');
  // const token = sessionStorage.getItem('instrument_token');
 
  // const quotefeed = getQuoteFeed(exchange, parseInt(token));
  // stx.attachQuoteFeed(quotefeed, { refreshInterval: 1 });

  return stx;
}