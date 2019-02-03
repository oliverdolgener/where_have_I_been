import { SQLite } from 'expo';

import * as Earth from '../constants/Earth';

const db = SQLite.openDatabase('whib.db');

export function createDB() {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS location (id INTEGER PRIMARY KEY NOT NULL, latitude BLOB NOT NULL, longitude BLOB NOT NULL)',
    );
  });
}

export function deleteLocations() {
  db.transaction((tx) => {
    tx.executeSql('DELETE FROM location', []);
  });
}

export function getLocations() {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM location', [], (_, { rows: { _array } }) => {
        resolve(_array);
      });
    });
  });
}

export function getCount() {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql('SELECT COUNT(*) as count FROM location', [], (_, { rows: { _array } }) => {
        resolve(_array[0].count);
      });
    });
  });
}

export function getLocationsInRegion(region, factor = 1) {
  const minLatitude = region.latitude - region.latitudeDelta / (2 / factor);
  const maxLatitude = region.latitude + region.latitudeDelta / (2 / factor);
  const minLongitude = region.longitude - region.longitudeDelta / (2 / factor);
  const maxLongitude = region.longitude + region.longitudeDelta / (2 / factor);

  // if (borderRight > 180) {
  //   const isInLeftHalf = longitude >= borderLeft && longitude <= 180;
  //   const isInRightHalf = longitude <= borderRight - 360 && longitude >= -180;
  //   return isInLeftHalf || isInRightHalf;
  // }

  // if (borderLeft < -180) {
  //   const isInLeftHalf = longitude >= borderLeft + 360 && longitude <= 180;
  //   const isInRightHalf = longitude <= borderRight && longitude >= -180;
  //   return isInLeftHalf || isInRightHalf;
  // }

  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM location WHERE latitude > ? AND latitude < ? And longitude > ? AND longitude < ?',
        [minLatitude, maxLatitude, minLongitude, maxLongitude],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
      );
    });
  });
}

export function getSurroundingLocations(position) {
  const region = {
    latitude: position.latitude,
    longitude: position.longitude,
    latitudeDelta: Earth.DELTA,
    longitudeDelta: Earth.DELTA,
  };
  return getLocationsInRegion(region, 2);
}

export function getVisibleLocations(region) {
  return getLocationsInRegion(region, 2);
}

export function insertLocations(locations) {
  return new Promise((resolve) => {
    db.transaction(
      (tx) => {
        locations.forEach((x) => {
          tx.executeSql('INSERT INTO location (latitude, longitude) VALUES (?, ?);', [
            x.latitude,
            x.longitude,
          ]);
        });
      },
      null,
      resolve(),
    );
  });
}

export function deleteLocation(location) {
  return new Promise((resolve) => {
    db.transaction(
      (tx) => {
        tx.executeSql('DELETE FROM location WHERE latitude = ? And longitude = ?', [
          location.latitude,
          location.longitude,
        ]);
      },
      null,
      resolve(),
    );
  });
}
