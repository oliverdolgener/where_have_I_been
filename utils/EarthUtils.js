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
  const zoom = region.latitudeDelta;

  if (zoom < 0.1) {
    return Earth.GRID_DISTANCE;
  }

  if (zoom < 0.25) {
    return Earth.GRID_DISTANCE * 2.5;
  }

  if (zoom < 0.5) {
    return Earth.GRID_DISTANCE * 5;
  }

  if (zoom < 1) {
    return Earth.GRID_DISTANCE * 10;
  }

  if (zoom < 2.5) {
    return Earth.GRID_DISTANCE * 25;
  }

  if (zoom < 5) {
    return Earth.GRID_DISTANCE * 50;
  }

  if (zoom < 10) {
    return Earth.GRID_DISTANCE * 100;
  }

  if (zoom < 25) {
    return Earth.GRID_DISTANCE * 250;
  }

  if (zoom < 50) {
    return Earth.GRID_DISTANCE * 500;
  }

  return Earth.GRID_DISTANCE * 1000;
}
