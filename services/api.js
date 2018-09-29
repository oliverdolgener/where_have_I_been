import URI from 'urijs';

const API_URL = 'https://api.0llum.de/';

const ENDPOINT_USER = 'user';
const ENDPOINT_LOGIN = 'login';
const ENDPOINT_LOCATION = 'location';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const fetchJson = (url, options) =>
  fetch(url, options).then(response =>
    response
      .json()
      .then(json => (response.ok ? { headers: response.headers, data: json } : Promise.reject(json))));

export const getUser = (userId) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_LOCATION).segment(userId);
  return fetchJson(url.href());
};

export const login = (email, password) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_LOGIN);
  const body = JSON.stringify({
    email,
    password,
  });
  const options = {
    method: 'POST',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};

export const signup = (email, password) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_USER);
  const body = JSON.stringify({
    email,
    password,
  });
  const options = {
    method: 'POST',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};

export const saveTiles = (userId, tilesToSave) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_LOCATION).segment(userId);
  const body = JSON.stringify({
    locations: tilesToSave,
  });
  const options = {
    method: 'POST',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};
