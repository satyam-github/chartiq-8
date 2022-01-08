import axios from 'axios';

const getHeaders = () => ({
  'x-authorization-token': sessionStorage.getItem('auth_token'),
  'x-device-type': sessionStorage.getItem('device'),
});


export function contraAPI({ method, endpoint, params, data, headers }) {
  return new Promise((resolve, reject) => {
    axios({
      method,
      url: endpoint,
      headers: headers || getHeaders(),
      params,
      data,
    })
      .then((resp) => {
        const data = resp.data || {};
        const error = data.error || {};
        if (error.code === 0) {
          resolve(data);
        } else {
          reject(error.message || 'request failed');
        }
      })
      .catch((err) => {
        const errorResponse = (err && err.response) || {};
        if (errorResponse.data && errorResponse.data.message) {
          reject(errorResponse.data.message);
        } else {
          reject(errorResponse.statusText);
        }
      });
  });
}

export function primusAPI({ method, endpoint, params, data, headers }) {
  return new Promise((resolve, reject) => {
    axios({
      method,
      url: endpoint,
      headers: headers || getHeaders(),
      params,
      data,
    })
      .then((resp) => {
        const data = resp.data || {};
        if (data.status === 'success') {
          resolve(data);
        } else if (data.status === 'error') {
          reject(data.message || 'error');
        } else {
          reject('Invalid response');
        }
      })
      .catch((err) => {
        const errorResponse = (err && err.response) || {};
        if (errorResponse.status === 401) {
          reject(errorResponse.statusText);
          localStorage.removeItem('token');
          window.location.reload();
          return;
        }

        if (errorResponse.data && errorResponse.data.message) {
          reject(errorResponse.data.message);
        } else {
          reject(errorResponse.statusText);
        }
      });
  });
}
