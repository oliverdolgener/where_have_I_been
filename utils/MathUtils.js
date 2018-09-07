import * as EarthUtils from '../utils/EarthUtils';
import * as SortUtils from '../utils/SortUtils';

export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

export function toKmh(ms) {
  return ms * 3.6;
}

export function toMs(kmh) {
  return kmh / 3.6;
}

export function roundToMultiples(value, multiples) {
  return Math.round(value / multiples) * multiples;
}

export function roundToDecimals(value, decimals) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export function round(value, decimals, multiples = 1) {
  return roundToMultiples(value * 10 ** decimals, multiples) / 10 ** decimals;
}

export function isEqual(locationA, locationB) {
  return locationA.latitude === locationB.latitude && locationA.longitude === locationB.longitude;
}

export function containsLocation(location, array) {
  return array.find(x => isEqual(x, location));
}

export function containsDuplicateLocations(array) {
  if (array < 2) {
    return false;
  }

  array.sort(SortUtils.byLatitudeDesc);
  for (let i = 0; i < array.length - 1; i++) {
    const current = array[i];
    const next = array[i + 1];
    if (isEqual(current, next)) {
      return true;
    }
  }

  return false;
}

export function getDuplicateLocations(array) {
  if (array < 2) {
    return [];
  }

  const duplicates = [];
  array.sort(SortUtils.byLatitudeDesc);
  for (let i = 0; i < array.length - 1; i++) {
    const current = array[i];
    const next = array[i + 1];
    if (isEqual(current, next)) {
      duplicates.push(next);
    }
  }

  return duplicates;
}

export function removeDuplicateLocations(array) {
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
    if (!isEqual(current, next)) {
      unique.push(next);
    }
  }

  return unique;
}

export function removeBothDuplicateLocations(array) {
  if (array.length < 1) {
    return [];
  }

  if (array.length === 1) {
    return array;
  }

  const unique = [];
  array.sort(SortUtils.byLatitudeDesc);
  unique.push(array[0]);
  for (let i = 1; i < array.length - 1; i++) {
    const previous = array[i - 1];
    const current = array[i];
    const next = array[i + 1];
    if (!isEqual(current, next) && !isEqual(current, previous)) {
      unique.push(current);
    }
  }
  unique.push(array[array.length - 1]);

  return unique;
}

export function arrayToGrid(locations) {
  if (locations.length < 1) {
    return [];
  }

  const preparedLocations = [];
  let row = {
    latitude: locations[0].latitude,
    locations: [locations[0]],
  };

  for (let i = 0; i < locations.length; i++) {
    const current = locations[i];
    const next = locations[i + 1];

    if (!next) {
      preparedLocations.push(row);
      break;
    }

    if (current.latitude === next.latitude) {
      row.locations.push(next);
    } else {
      preparedLocations.push(row);
      row = {
        latitude: next.latitude,
        locations: [next],
      };
    }
  }

  return preparedLocations;
}

export function gridToArray(locations) {
  const array = locations.map(x => x.locations);
  return [].concat(...array);
}

export function filterVisibleLocations(locations, region) {
  const visibleLocations = [];
  locations.forEach((x) => {
    if (EarthUtils.isLatitudeInRegion(x.latitude, region, 2)) {
      const row = {
        latitude: x.latitude,
        locations: [],
      };

      x.locations.forEach((y) => {
        if (EarthUtils.isLongitudeInRegion(y.longitude, region, 2)) {
          row.locations.push(y);
        }
      });

      if (row.locations.length > 0) {
        visibleLocations.push(row);
      }
    }
  });

  return visibleLocations;
}
