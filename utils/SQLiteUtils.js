import { SQLite } from 'expo';

const db = SQLite.openDatabase('whib.db');

export function createDB() {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS location (id INTEGER PRIMARY KEY NOT NULL, user_id INTEGER NOT NULL, latitude BLOB NOT NULL, longitude BLOB NOT NULL, timestamp BLOB);',
    );
  });
}

export function deleteLocations() {
  db.transaction((tx) => {
    tx.executeSql('DELETE FROM location', []);
  });
}

export function getLocations(userId) {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM location WHERE user_id = ?',
        [userId],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
      );
    });
  });
}

export function insertLocations(userId, locations) {
  db.transaction((tx) => {
    locations.forEach((x) => {
      tx.executeSql(
        'INSERT INTO location (user_id, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)',
        [userId, x.latitude, x.longitude, x.timestamp],
      );
    });
  });
}

export function deleteLocation(userId, location) {
  db.transaction((tx) => {
    tx.executeSql('DELETE FROM location WHERE user_id = ? AND latitude = ? And longitude = ?', [
      userId,
      location.latitude,
      location.longitude,
    ]);
  });
}
