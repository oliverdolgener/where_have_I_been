import * as Earth from '../constants/Earth';
import * as MathUtils from '../utils/MathUtils';

export function circumferenceAtLatitude(latitude) {
  return 2 * Math.PI * Earth.EARTH_RADIUS * Math.cos(MathUtils.toRadians(latitude));
}

export function pointsAtLatitude(latitude) {
  return (360 / Earth.GRID_DISTANCE) * Math.cos(MathUtils.toRadians(latitude));
}

export function gridDistanceAtLatitude(latitude) {
  return 360 / pointsAtLatitude(latitude);
}

export function getRoundedLatitude(latitude) {
  return MathUtils.roundToDecimals(
    Math.round(latitude / Earth.GRID_DISTANCE) * Earth.GRID_DISTANCE,
    6,
  );
}

export function getRoundedLongitude(longitude, latitude) {
  return MathUtils.roundToDecimals(
    Math.round(longitude / gridDistanceAtLatitude(latitude)) * gridDistanceAtLatitude(latitude),
    6,
  );
}

export function getSquareCoordinates(location) {
  const { latitude, longitude } = location;
  return [
    {
      latitude: latitude - Earth.GRID_DISTANCE / 2.01,
      longitude: longitude + gridDistanceAtLatitude(latitude) / 2.01,
    },
    {
      latitude: latitude - Earth.GRID_DISTANCE / 2.01,
      longitude: longitude - gridDistanceAtLatitude(latitude) / 2.01,
    },
    {
      latitude: latitude + Earth.GRID_DISTANCE / 2.01,
      longitude: longitude - gridDistanceAtLatitude(latitude) / 2.01,
    },
    {
      latitude: latitude + Earth.GRID_DISTANCE / 2.01,
      longitude: longitude + gridDistanceAtLatitude(latitude) / 2.01,
    },
  ];
}

export function getRectangleCoordinates(topLeft, botRight) {
  return [
    {
      latitude: botRight.latitude - Earth.GRID_DISTANCE / 2.01,
      longitude: botRight.longitude + gridDistanceAtLatitude(botRight.latitude) / 2.01,
    },
    {
      latitude: botRight.latitude - Earth.GRID_DISTANCE / 2.01,
      longitude: topLeft.longitude - gridDistanceAtLatitude(topLeft.latitude) / 2.01,
    },
    {
      latitude: topLeft.latitude + Earth.GRID_DISTANCE / 2.01,
      longitude: topLeft.longitude - gridDistanceAtLatitude(topLeft.latitude) / 2.01,
    },
    {
      latitude: topLeft.latitude + Earth.GRID_DISTANCE / 2.01,
      longitude: botRight.longitude + gridDistanceAtLatitude(botRight.latitude) / 2.01,
    },
  ];
}

export function convertSquaresToSlices(squares) {
  const slices = [];
  let first = squares[0];
  let last = squares[0];

  for (let i = 0; i < squares.length; i++) {
    const current = squares[i];
    const next = squares[i + 1];

    if (!current || !next) {
      break;
    }

    if (current.latitude === next.latitude) {
      if (next.longitude - current.longitude < gridDistanceAtLatitude(current.latitude) + 0.0001) {
        last = next;
      } else {
        slices.push(getRectangleCoordinates(first, last));
        first = next;
        last = next;
      }
    } else {
      slices.push(getRectangleCoordinates(first, last));
      first = next;
      last = next;
    }
  }

  return slices;
}
