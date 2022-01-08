import octopusInstance from './octopusInstance';

export default function wsExchangeMessage({
  arrExchangeNames,
  subscriptionLocation,
}) {

  const handlers = arrExchangeNames.map((exchange) => {
    return octopusInstance.wsHandler({
     messageType: 'ExchangeMessage',
     subscriptionLocation,
     payload: {
       exchangeCode: getExchangeCode(exchange)
     },
   });
  });

  return {
    subscribe: (cb) => {
      handlers.forEach((handler) => {
        handler.subscribe(cb);
      });
    },
    unsubscribe: () => {
      handlers.forEach((handler) => {
        handler.unsubscribe();
      })
    }
  }

}
