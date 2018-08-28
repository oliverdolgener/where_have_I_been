import * as Earth from '../constants/Earth';
import * as MathUtils from '../utils/MathUtils';
import * as SortUtils from '../utils/SortUtils';
import Coordinate from '../model/Coordinate';

export function circumferenceAtLatitude(latitude) {
  return 2 * Math.PI * Earth.EARTH_RADIUS * Math.cos(MathUtils.toRadians(latitude));
}

export function pointsAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
  return (360 / gridDistance) * Math.cos(MathUtils.toRadians(latitude));
}

export function gridDistanceAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
  return 360 / pointsAtLatitude(latitude, gridDistance);
}

export function getRectangleCoordinates(topLeft, botRight, gridDistance = Earth.GRID_DISTANCE) {
  return [
    {
      latitude: MathUtils.roundToDecimals(topLeft.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
      longitude: MathUtils.roundToDecimals(
        topLeft.longitude -
          gridDistanceAtLatitude(topLeft.latitude, gridDistance) / Earth.SQUARE_OFFSET -
          Earth.ROUND_OFFSET_LONG,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(topLeft.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude +
          gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(
        botRight.latitude - gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude +
          gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(
        botRight.latitude - gridDistance / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
        topLeft.longitude -
          gridDistanceAtLatitude(topLeft.latitude, gridDistance) / Earth.SQUARE_OFFSET -
          Earth.ROUND_OFFSET_LONG,
        6,
      ),
    },
  ];
}

export function getSquareCoordinates(location, gridDistance = Earth.GRID_DISTANCE) {
  return getRectangleCoordinates(location, location, gridDistance);
}

export function getSliceCoordinates(locations, gridDistance = Earth.GRID_DISTANCE) {
  if (locations.length === 1) {
    return [getSquareCoordinates(locations[0], gridDistance)];
  }

  const slices = [];
  locations = locations.map(x =>
    new Coordinate(
      Coordinate.getRoundedLatitude(x.latitude, gridDistance),
      Coordinate.getRoundedLongitude(x.longitude, x.latitude, gridDistance),
    ));
  locations = MathUtils.removeDuplicateLocations(locations);
  locations.sort(SortUtils.byLatitudeDesc);
  let first = locations[0];
  let last = locations[0];

  for (let i = 0; i < locations.length; i++) {
    const current = locations[i];
    const next = locations[i + 1];

    if (!next) {
      slices.push(getRectangleCoordinates(first, last, gridDistance));
      break;
    }

    if (current.latitude === next.latitude) {
      if (
        next.longitude - current.longitude <
        gridDistanceAtLatitude(current.latitude, gridDistance) + Earth.SLICE_OFFSET
      ) {
        last = next;
      } else {
        slices.push(getRectangleCoordinates(first, last, gridDistance));
        first = next;
        last = next;
      }
    } else {
      slices.push(getRectangleCoordinates(first, last, gridDistance));
      first = next;
      last = next;
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
      (polygon[i].latitude <= coordinate.latitude &&
        polygon[i + 1].latitude > coordinate.latitude) ||
      (polygon[i].latitude > coordinate.latitude && polygon[i + 1].latitude <= coordinate.latitude)
    ) {
      const intersect =
        (coordinate.latitude - polygon[i].latitude) /
        (polygon[i + 1].latitude - polygon[i].latitude);
      if (
        coordinate.longitude <
        polygon[i].longitude + intersect * (polygon[i + 1].longitude - polygon[i].longitude)
      ) {
        crossings++;
      }
    }
  }
  return crossings % 2 !== 0;
}
