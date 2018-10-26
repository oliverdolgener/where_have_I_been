import URI from 'urijs';

const API_URL = 'https://api.0llum.de/';

const ENDPOINT_USER = 'user';
const ENDPOINT_LOGIN = 'login';
const ENDPOINT_LOCATION = 'location';
const ENDPOINT_FRIEND = 'friend';
const ENDPOINT_COUNTRY = 'country';
const ENDPOINT_AIRPORT = 'airport';
const ENDPOINT_FLIGHT = 'flight';
const ENDPOINT_VACATION = 'vacation';

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const fetchJson = (url, options) => fetch(url, options).then(response => response
  .json()
  .then(
    json => (response.ok ? { headers: response.headers, data: json } : Promise.reject(json)),
  ));

export const getUser = (userId) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_LOCATION).segment(userId.toString());
  return fetchJson(url.href());
};

export const login = (email, password, pushToken) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_LOGIN);
  const body = JSON.stringify({
    email,
    password,
    pushToken,
  });
  const options = {
    method: 'POST',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};

export const signup = (email, password, pushToken) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_USER);
  const body = JSON.stringify({
    email,
    password,
    pushToken,
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
  url.segment(ENDPOINT_LOCATION).segment(userId.toString());
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

export const getFriends = (userId) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_FRIEND).segment(userId.toString());
  return fetchJson(url.href());
};

export const addFriend = (userId, friendName) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_FRIEND).segment(userId.toString());
  const body = JSON.stringify({
    friendName,
  });
  const options = {
    method: 'POST',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};

export const removeFriend = (userId, friendId) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_FRIEND).segment(userId.toString());
  const body = JSON.stringify({
    friendId,
  });
  const options = {
    method: 'DELETE',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};

export const getCountries = () => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_COUNTRY);
  return fetchJson(url.href());
};

export const getAirports = () => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_AIRPORT);
  return fetchJson(url.href());
};

export const getFlights = (userId) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_FLIGHT).segment(userId.toString());
  return fetchJson(url.href());
};

export const addFlight = (userId, from, to) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_FLIGHT).segment(userId.toString());
  const body = JSON.stringify({
    from,
    to,
  });
  const options = {
    method: 'POST',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};

export const getVacations = (userId) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_VACATION).segment(userId.toString());
  return fetchJson(url.href());
};

export const setVacation = (userId, countryId, status) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_VACATION).segment(userId.toString());
  const body = JSON.stringify({
    countryId,
    status,
  });
  const options = {
    method: 'POST',
    headers,
    body,
  };
  return fetchJson(url.href(), options);
};
