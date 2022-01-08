import { contraAPI, primusAPI } from './request';

export function fetchScripInfo(exchange, token) {
  return contraAPI({
    endpoint: `/api/v1/contract/${exchange}`,
    method: 'GET',
    params: {
      info: 'scrip',
      token,
    },
  });
}

export function searchInstrument(query) {
  return contraAPI({
    endpoint: `/api/v1/search`,
    method: "GET",
    params: { key: (query || "").trim() },
  });
}

// params should contain { exchange, token, candletype, starttime, endtime, type }
export function fetchChartData(params) {
  return primusAPI({
    endpoint: '/api/v1/charts',
    method: 'GET',
    params,
  });
}

export function fetchPositions(positionType) {
  return primusAPI({
    endpoint: "/api/v1/positions",
    method: "GET",
    params: {
      // client_id: localStorage.getItem("login_id"),
      client_id: sessionStorage.getItem("login_id"),
      type: positionType,
    },
  });
}

export function placeRegularOrder(payload) {
  return primusAPI({
    endpoint: "/api/v1/orders",
    method: "POST",
    data: payload,
  });
}

export function modifyRegularOrder(payload) {
  return primusAPI({
    endpoint: "/api/v1/orders",
    method: "PUT",
    data: payload,
  });
}


export function deletePendingOrder(oms_order_id, execution_type) {
  return primusAPI({
    endpoint: `/api/v1/orders/${oms_order_id}`,
    method: "DELETE",
    params: {
      client_id: sessionStorage.getItem("login_id"),
      execution_type,
    },
  });
}


export function fetchPendingOrders() {
  return primusAPI({
    endpoint: "/api/v1/orders",
    method: "GET",
    params: {
      type: "pending",
      client_id: sessionStorage.getItem("login_id"),
    },
  });
}

