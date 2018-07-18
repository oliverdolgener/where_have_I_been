import * as Earth from '../constants/Earth';
import * as MathUtils from '../utils/MathUtils';
import * as SortUtils from '../utils/SortUtils';

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
      latitude: MathUtils.roundToDecimals(latitude + Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(longitude - gridDistanceAtLatitude(latitude) / 2.01, 6),
    },
    {
      latitude: MathUtils.roundToDecimals(latitude + Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(longitude + gridDistanceAtLatitude(latitude) / 2.01, 6),
    },
    {
      latitude: MathUtils.roundToDecimals(latitude - Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(longitude + gridDistanceAtLatitude(latitude) / 2.01, 6),
    },
    {
      latitude: MathUtils.roundToDecimals(latitude - Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(longitude - gridDistanceAtLatitude(latitude) / 2.01, 6),
    },
  ];
}

export function getSquareEdges(location) {
  const coordinates = getSquareCoordinates(location);
  return [
    [coordinates[0], coordinates[1]],
    [coordinates[1], coordinates[2]],
    [coordinates[3], coordinates[2]],
    [coordinates[0], coordinates[3]],
  ];
}

export function getRectangleCoordinates(topLeft, botRight) {
  return [
    {
      latitude: MathUtils.roundToDecimals(topLeft.latitude + Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(
        topLeft.longitude - gridDistanceAtLatitude(topLeft.latitude) / 2.01,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(topLeft.latitude + Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude + gridDistanceAtLatitude(botRight.latitude) / 2.01,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(botRight.latitude - Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude + gridDistanceAtLatitude(botRight.latitude) / 2.01,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(botRight.latitude - Earth.GRID_DISTANCE / 2.01, 6),
      longitude: MathUtils.roundToDecimals(
        topLeft.longitude - gridDistanceAtLatitude(topLeft.latitude) / 2.01,
        6,
      ),
    },
  ];
}

export function convertSquaresToSlices(squares) {
  const slices = [];
  squares.sort(SortUtils.byLatitudeDesc);
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

export function convertSlicesToPolygons(slices) {
  const polygons = slices;
  return polygons;
}

export const EdgeType = {
  HORIZONTAL: 0,
  VERTICAL: 1,
  DIAGONAL: 2,
};

export function getEdgeDirection(edge) {
  const start = edge[0];
  const end = edge[1];

  if (start.latitude === end.latitude) {
    return EdgeType.HORIZONTAL;
  }

  if (start.longitude === end.longitude) {
    return EdgeType.VERTICAL;
  }

  return EdgeType.DIAGONAL;
}

export function isPointOnEdge(point, edge) {
  const start = edge[0];
  const end = edge[1];

  switch (getEdgeDirection(edge)) {
    case EdgeType.HORIZONTAL:
      return (
        point.latitude === start.latitude &&
        point.longitude >= start.longitude &&
        point.longitude <= end.longitude
      );
    case EdgeType.VERTICAL:
      return (
        point.longitude === start.longitude &&
        (point.latitude <= start.latitude && point.latitude >= end.latitude)
      );
    default:
      return false;
  }
}
