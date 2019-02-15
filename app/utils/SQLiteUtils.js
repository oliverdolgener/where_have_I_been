import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'whib.db', location: 'default' });

export function createDB() {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS location (id INTEGER PRIMARY KEY NOT NULL, latitude BLOB NOT NULL, longitude BLOB NOT NULL)',
    );
    tx.executeSql(
      'CREATE UNIQUE INDEX latlng ON location (latitude, longitude);',
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
      tx.executeSql('SELECT * FROM location', [], (_, res, err) => {
        if (err) console.log(err);
        resolve(res.rows);
      });
    });
  });
}

export function insertLocations(locations) {
  return new Promise((resolve) => {
    db.transaction(
      (tx) => {
        locations.forEach((x) => {
          tx.executeSql(
            'INSERT INTO location (latitude, longitude) VALUES (?, ?);',
            [x.latitude, x.longitude],
          );
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
        tx.executeSql(
          'DELETE FROM location WHERE latitude = ? And longitude = ?',
          [location.latitude, location.longitude],
        );
      },
      null,
      resolve(),
    );
  });
}
