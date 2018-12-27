import GeoLocation from './GeoLocation';
import * as SortUtils from '../utils/SortUtils';

export default class GeoArray {
  constructor(array) {
    this.geoArray = GeoArray.fromArray(array);
  }

  static contains = (location, array) => array.find(x => GeoLocation.isEqual(x, location));

  static remove(location, array) {
    for (let i = 0; i < array.length; i++) {
      if (GeoLocation.isEqual(location, array[i])) {
        array.splice(i, 1);
        return array;
      }
    }
    return array;
  }

  static removeDuplicates(array) {
    if (array.length < 1) {
      return [];
    }

    if (array.length === 1) {
      return array;
    }

    const unique = [];
    array.sort(SortUtils.byLatitudeDesc);
    unique.push(array[0]);
    for (let i = 0; i < array.length - 1; i++) {
      const current = array[i];
      const next = array[i + 1];
      if (!GeoLocation.isEqual(current, next)) {
        unique.push(next);
      }
    }

    return unique;
  }

  static fromArray = array => array.map(x => new GeoLocation(x.latitude, x.longitude, x.timestamp));

  static toGrid(array) {
    if (array.length < 1) {
      return [];
    }

    const grid = [];

    let row = {
      latitude: array[0].latitude,
      locations: [array[0]],
    };

    for (let i = 0; i < array.length; i++) {
      const current = array[i];
      const next = array[i + 1];

      if (!next) {
        grid.push(row);
        break;
      }

      if (current.latitude == next.latitude) {
        if (current.longitude == next.longitude) {
          break;
        }
        row.locations.push(next);
      } else {
        grid.push(row);
        row = {
          latitude: next.latitude,
          locations: [next],
        };
      }
    }

    return grid;
  }

  static toRegion(array) {
    let latMin = array[0].latitude;
    let latMax = array[0].latitude;
    let longMin = array[0].longitude;
    let longMax = array[0].longitude;

    array.forEach((location) => {
      latMin = Math.min(latMin, location.latitude);
      latMax = Math.max(latMax, location.latitude);
      longMin = Math.min(longMin, location.longitude);
      longMax = Math.max(longMax, location.longitude);
    });

    return {
      latitude: (latMin + latMax) / 2,
      longitude: (longMin + longMax) / 2,
      latitudeDelta: latMax - latMin,
      longitudeDelta: longMax - longMin,
    };
  }

  contains = location => GeoArray.contains(location, this);

  remove = location => GeoArray.remove(location, this);

  removeDuplicates = () => GeoArray.removeDuplicates(this);

  toGrid = () => GeoArray.toGrid(this);

  toRegion = () => GeoArray.toRegion(this);
}
