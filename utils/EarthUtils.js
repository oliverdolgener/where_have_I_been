import * as Earth from '../constants/Earth';
import * as MathUtils from './MathUtils';
import Coordinate from '../model/Coordinate';

export function circumferenceAtLatitude(latitude) {
  return 2 * Math.PI * Earth.EARTH_RADIUS * Math.cos(MathUtils.toRadians(latitude));
}

export function pointsAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
  return Math.round((360 / gridDistance) * Math.cos(MathUtils.toRadians(latitude)));
}

export function gridDistanceAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
  return 360 / pointsAtLatitude(latitude, gridDistance);
}

export function getRectangleCoordinates(topLeft, botRight, gridDistance = Earth.GRID_DISTANCE) {
  return [
    {
      latitude: MathUtils.roundToDecimals(topLeft.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
      longitude: MathUtils.roundToDecimals(
        topLeft.longitude
          - gridDistanceAtLatitude(topLeft.latitude, gridDistance) / Earth.SQUARE_OFFSET
          - Earth.ROUND_OFFSET_LONG,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(topLeft.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude
          + gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(
        botRight.latitude - gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude
          + gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(
        botRight.latitude - gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
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
  const array = MathUtils.gridToArray(coordinates);
  const resizedLocations = MathUtils.removeDuplicateLocations(array.map(x => new Coordinate(
    Coordinate.getRoundedLatitude(x.latitude, gridDistance),
    Coordinate.getRoundedLongitude(x.longitude, x.latitude, gridDistance),
  )));
  const locations = MathUtils.arrayToGrid(resizedLocations);

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
