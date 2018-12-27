import { SQLite } from 'expo';

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

export function insertLocations(locations) {
  db.transaction((tx) => {
    locations.forEach((x) => {
      tx.executeSql('INSERT INTO location (latitude, longitude) VALUES (?, ?)', [
        x.latitude,
        x.longitude,
      ]);
    });
  });
}

export function deleteLocation(location) {
  db.transaction((tx) => {
    tx.executeSql('DELETE FROM location WHERE latitude = ? And longitude = ?', [
      location.latitude,
      location.longitude,
    ]);
  });
}
