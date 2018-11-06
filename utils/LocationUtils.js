import Region2D from 'region2d';

import Coordinate from '../model/Coordinate';
import * as ConversionUtils from './ConversionUtils';
import * as RoundUtils from './RoundUtils';
import * as SortUtils from './SortUtils';
import * as Earth from '../constants/Earth';

export function isEqual(locationA, locationB) {
  return locationA.latitude === locationB.latitude && locationA.longitude === locationB.longitude;
}

export function containsLocation(location, array) {
  return array.find(x => isEqual(x, location));
}

export function isLocationInGrid(location, grid) {
  const row = grid.find(x => x.latitude === location.latitude);
  if (row) {
    return row.locations.find(x => x.longitude === location.longitude);
  }
  return false;
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

export function arrayToGrid(array) {
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

    if (current.latitude === next.latitude) {
      if (current.longitude === next.longitude) {
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

export function gridToArray(locations) {
  const array = locations.map(x => x.locations);
  return [].concat(...array);
}

export function isLatitudeInRegion(latitude, region, factor = 1) {
  const borderTop = region.latitude + region.latitudeDelta / (2 / factor);
  const borderTopBottom = region.latitude - region.latitudeDelta / (2 / factor);
  return latitude <= borderTop && latitude >= borderTopBottom;
}

export function isLongitudeInRegion(longitude, region, factor = 1) {
  const borderRight = region.longitude + region.longitudeDelta / (2 / factor);
  const borderLeft = region.longitude - region.longitudeDelta / (2 / factor);

  if (borderRight > 180) {
    const isInLeftHalf = longitude >= borderLeft && longitude <= 180;
    const isInRightHalf = longitude <= borderRight - 360 && longitude >= -180;
    return isInLeftHalf || isInRightHalf;
  }

  if (borderLeft < -180) {
    const isInLeftHalf = longitude >= borderLeft + 360 && longitude <= 180;
    const isInRightHalf = longitude <= borderRight && longitude >= -180;
    return isInLeftHalf || isInRightHalf;
  }

  return longitude <= borderRight && longitude >= borderLeft;
}

export function isCoordinateInRegion(coordinate, region, factor = 1) {
  return (
    isLatitudeInRegion(coordinate.latitude, region, factor)
    && isLongitudeInRegion(coordinate.longitude, region, factor)
  );
}

export function filterVisibleLocations(locations, region) {
  const visibleLocations = [];
  locations.forEach((x) => {
    if (isLatitudeInRegion(x.latitude, region, 3)) {
      const row = {
        latitude: x.latitude,
        locations: [],
      };

      x.locations.forEach((y) => {
        if (isLongitudeInRegion(y.longitude, region, 3)) {
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

export function insertIntoGrid(grid, location) {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].latitude === location.latitude) {
      const row = grid[i].locations;
      for (let k = 0; k < row.length; k++) {
        if (row[k].longitude > location.longitude) {
          grid[i].locations.splice(k, 0, location);
          return grid;
        }
        grid[i].locations.push(location);
        return grid;
      }
    }

    if (grid[i].latitude > location.latitude) {
      grid.splice(i, 0, {
        latitude: location.latitude,
        locations: [location],
      });
      return grid;
    }
  }

  grid.push({
    latitude: location.latitude,
    locations: [location],
  });
  return grid;
}

export function circumferenceAtLatitude(latitude) {
  return 2 * Math.PI * Earth.EARTH_RADIUS * Math.cos(ConversionUtils.toRadians(latitude));
}

export function pointsAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
  return Math.round((360 / gridDistance) * Math.cos(ConversionUtils.toRadians(latitude)));
}

export function gridDistanceAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
  return 360 / pointsAtLatitude(latitude, gridDistance);
}

export function getRectangleCoordinates(topLeft, botRight, gridDistance = Earth.GRID_DISTANCE) {
  return [
    {
      latitude: RoundUtils.roundToDecimals(
        topLeft.latitude + gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: RoundUtils.roundToDecimals(
        topLeft.longitude
          - gridDistanceAtLatitude(topLeft.latitude, gridDistance) / Earth.SQUARE_OFFSET
          - Earth.ROUND_OFFSET_LONG,
        6,
      ),
    },
    {
      latitude: RoundUtils.roundToDecimals(
        topLeft.latitude + gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: RoundUtils.roundToDecimals(
        botRight.longitude
          + gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: RoundUtils.roundToDecimals(
        botRight.latitude - gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: RoundUtils.roundToDecimals(
        botRight.longitude
          + gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: RoundUtils.roundToDecimals(
        botRight.latitude - gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: RoundUtils.roundToDecimals(
        topLeft.longitude
          - gridDistanceAtLatitude(topLeft.latitude, gridDistance) / Earth.SQUARE_OFFSET
          - Earth.ROUND_OFFSET_LONG,
        6,
      ),
    },
  ];
}

export function getSquareCoordinates(location, gridDistance = Earth.GRID_DISTANCE) {
  return getRectangleCoordinates(location, location, gridDistance);
}

export function getSliceCoordinates(coordinates, gridDistance = Earth.GRID_DISTANCE) {
  const slices = [];
  const array = gridToArray(coordinates);
  const resizedLocations = removeDuplicateLocations(
    array.map(
      x => new Coordinate(
        Coordinate.getRoundedLatitude(x.latitude, gridDistance),
        Coordinate.getRoundedLongitude(x.longitude, x.latitude, gridDistance),
      ),
    ),
  );
  const locations = arrayToGrid(resizedLocations);

  for (let i = 0; i < locations.length; i++) {
    const row = locations[i].locations;
    let first = row[0];
    let last = row[0];
    for (let k = 0; k < row.length; k++) {
      const current = row[k];
      const next = row[k + 1];

      if (next) {
        if (
          next.longitude - current.longitude
          < gridDistanceAtLatitude(current.latitude, gridDistance) + Earth.SLICE_OFFSET
        ) {
          last = next;
        } else {
          slices.push(getRectangleCoordinates(first, last, gridDistance));
          first = next;
          last = next;
        }
      } else {
        slices.push(getRectangleCoordinates(first, last, gridDistance));
      }
    }
  }

  return slices;
}

export function getGridDistanceByRegion(region) {
  let zoom = region.longitudeDelta > 0 ? region.longitudeDelta : 360 + region.longitudeDelta;

  if (zoom < 0.1) {
    return Earth.GRID_DISTANCE;
  }

  if (zoom < 1) {
    zoom = Math.round(zoom * 10) / 10;
  } else if (zoom < 10) {
    zoom = Math.round(zoom);
  } else {
    zoom = Math.round(zoom / 10) * 10;
  }

  if (zoom > 50) {
    return Earth.GRID_DISTANCE * 1000;
  }

  return zoom / 50;
}

export function isPointInPolygon(coordinate, polygon) {
  // polygon[i+1] must be === polygon[0]
  let crossings = 0;

  for (let i = 0; i < polygon.length - 1; i++) {
    if (
      (polygon[i].latitude <= coordinate.latitude
        && polygon[i + 1].latitude > coordinate.latitude)
      || (polygon[i].latitude > coordinate.latitude && polygon[i + 1].latitude <= coordinate.latitude)
    ) {
      const intersect = (coordinate.latitude - polygon[i].latitude)
        / (polygon[i + 1].latitude - polygon[i].latitude);
      if (
        coordinate.longitude
        < polygon[i].longitude + intersect * (polygon[i + 1].longitude - polygon[i].longitude)
      ) {
        crossings++;
      }
    }
  }

  return crossings % 2 !== 0;
}

export function coordinatesToRegion(coordinates) {
  let latMin = coordinates[0].latitude;
  let latMax = coordinates[0].latitude;
  let longMin = coordinates[0].longitude;
  let longMax = coordinates[0].longitude;

  coordinates.forEach((coordinate) => {
    latMin = Math.min(latMin, coordinate.latitude);
    latMax = Math.max(latMax, coordinate.latitude);
    longMin = Math.min(longMin, coordinate.longitude);
    longMax = Math.max(longMax, coordinate.longitude);
  });

  return {
    latitude: (latMin + latMax) / 2,
    longitude: (longMin + longMax) / 2,
    latitudeDelta: latMax - latMin,
    longitudeDelta: longMax - longMin,
  };
}

export function normalize(slice) {
  const left = RoundUtils.roundToDecimals(slice[0].longitude + 180, 6);
  const top = RoundUtils.roundToDecimals((slice[0].latitude - 90) * -1, 4);
  const right = RoundUtils.roundToDecimals(slice[2].longitude + 180, 6);
  const bottom = RoundUtils.roundToDecimals((slice[2].latitude - 90) * -1, 4);
  return [left, top, right, bottom];
}

export function denormalize(array) {
  const result = array.map(e => ({
    latitude: RoundUtils.roundToDecimals((e.y - 90) * -1, 4),
    longitude: RoundUtils.roundToDecimals(e.x - 180, 6),
  }));
  return result;
}

export function pathToPolygons(path) {
  return path.map(x => denormalize(x));
}

export function getRegions(slices) {
  let union = new Region2D(normalize(slices[0]));
  for (let i = 1; i < slices.length; i++) {
    union = union.union(new Region2D(normalize(slices[i])));
  }
  const polygons = pathToPolygons(union.getPath());
  return polygons;
}
