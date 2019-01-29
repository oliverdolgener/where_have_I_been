import URI from 'urijs';

const API_URL = 'https://api.0llum.de/';
// const PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const PLACES_URL = 'https://api.foursquare.com/v2/venues/search';
// const PLACES_URL = 'https://api.sygictravelapi.com/1.1/en/places/list';
// const ELEVATION_URL = 'https://api.open-elevation.com/api/v1/lookup';
const ELEVATION_URL = 'https://elevation-api.io/api/elevation';

const ENDPOINT_USER = 'user';
const ENDPOINT_LOGIN = 'login';
const ENDPOINT_LOCATION = 'location2';
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

export const getLocations = (userId) => {
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

export const setUserPushToken = (userId, pushToken) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_USER).segment(userId.toString());
  const body = JSON.stringify({
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

export const removeTile = (userId, tile) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_LOCATION).segment(userId.toString());
  const body = JSON.stringify({
    location: tile,
  });
  const options = {
    method: 'DELETE',
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

export const removeFlight = (userId, from, to) => {
  const url = new URI(API_URL);
  url.segment(ENDPOINT_FLIGHT).segment(userId.toString());
  const body = JSON.stringify({
    from,
    to,
  });
  const options = {
    method: 'DELETE',
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

// export const getPlaces = (center) => {
//   const url = new URI(PLACES_URL);
//   url.addQuery('location', `${center.latitude},${center.longitude}`);
//   // url.addQuery('radius', '5000');
//   url.addQuery('rankby', 'distance');
//   url.addQuery('type', 'park');
//   url.addQuery('key', 'AIzaSyAtzcxNVjs7P539qpPg_Eq0ur27QHE1imA');
//   return fetchJson(url.href());
// };

const burg = '50aaa49e4b90af0d42d5de11';
const friedhof = '4bf58dd8d48988d15c941735';
const nationalpark = '52e81612bcbc57f1066b7a21';
const schloss = '52e81612bcbc57f1066b7a14';
const park = '4bf58dd8d48988d163941735';
const platz = '4bf58dd8d48988d164941735';
const aussichtspunkt = '4bf58dd8d48988d165941735';
const bibliothek = '4bf58dd8d48988d12f941735';
const spirituellesZentrum = '4bf58dd8d48988d131941735';
const zoo = '4bf58dd8d48988d17b941735';
const freizeitpark = '4bf58dd8d48988d182941735';
const stadion = '4bf58dd8d48988d184941735';
const oeffentlichesKunstwerk = '507c8c4091d498d9fc8c67a9';
const opernhaus = '4bf58dd8d48988d136941735';
const theater = '4bf58dd8d48988d137941735';
const museum = '4bf58dd8d48988d181941735';
const gedenkstaette = '5642206c498e4bfca532186c';
const historischerOrt = '4deefb944765f83613cdba6e';
const aquarium = '4fceea171983d5d06c3e9823';
const amphitheater = '56aa371be4b08b9a8d5734db';

export const getPlaces = (center) => {
  const url = new URI(PLACES_URL);
  url.addQuery('ll', `${center.latitude},${center.longitude}`);
  url.addQuery('radius', '1000');
  url.addQuery('rankby', 'distance');
  url.addQuery('limit', '10');
  url.addQuery(
    'categoryId',
    `${burg},${friedhof},${nationalpark},${schloss},${park},${platz},${aussichtspunkt},${bibliothek},${spirituellesZentrum},${zoo},${freizeitpark},${stadion},${oeffentlichesKunstwerk},${opernhaus},${theater},${museum},${gedenkstaette},${historischerOrt},${aquarium},${amphitheater}`,
  );
  url.addQuery('client_id', 'KSPJOUXTIN0ZBSQRDSYSEP3DHGOZVUF3N2DNTXWJZWWP2LRJ');
  url.addQuery('client_secret', 'Z4GSG3GFLYFE0CFDZUSAV0UIZNIUL0LQ3RJ41KJOP4XGOVC2');
  url.addQuery('v', '20190119');
  return fetchJson(url.href());
};

// export const getPlaces = (center) => {
//   const url = new URI(PLACES_URL);
//   url.addQuery('area', `${center.latitude},${center.longitude},10000`);
//   url.addQuery('levels', 'poi');
//   url.addQuery('categories', 'sightseeing');
//   const options = {
//     headers: {
//       ...headers,
//       'x-api-key': 'HZlRUC9Z70985EpLcSl9W5hv3WtZLlY553Ufiorv',
//     },
//   };
//   return fetchJson(url.href(), options);
// };

export const getElevation = (center) => {
  const url = new URI(ELEVATION_URL);
  // url.addQuery('locations', `${center.latitude},${center.longitude}`);
  url.addQuery('points', `${center.latitude},${center.longitude}`);
  return fetchJson(url.href());
};
