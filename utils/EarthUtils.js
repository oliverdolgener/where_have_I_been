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

export function getRectangleCoordinates(topLeft, botRight) {
  return [
    {
      latitude: MathUtils.roundToDecimals(
        topLeft.latitude + Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
        topLeft.longitude -
          gridDistanceAtLatitude(topLeft.latitude) / Earth.SQUARE_OFFSET -
          Earth.ROUND_OFFSET_LONG,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(
        topLeft.latitude + Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude + gridDistanceAtLatitude(botRight.latitude) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(
        botRight.latitude - Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
        botRight.longitude + gridDistanceAtLatitude(botRight.latitude) / Earth.SQUARE_OFFSET,
        6,
      ),
    },
    {
      latitude: MathUtils.roundToDecimals(
        botRight.latitude - Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET,
        6,
      ),
      longitude: MathUtils.roundToDecimals(
        topLeft.longitude -
          gridDistanceAtLatitude(topLeft.latitude) / Earth.SQUARE_OFFSET -
          Earth.ROUND_OFFSET_LONG,
        6,
      ),
    },
  ];
}

export function getSquareCoordinates(location) {
  return getRectangleCoordinates(location, location);
}

export function getSliceCoordinates(locations) {
  if (locations.length === 1) {
    return [getSquareCoordinates(locations[0])];
  }

  const slices = [];
  locations.sort(SortUtils.byLatitudeDesc);
  let first = locations[0];
  let last = locations[0];

  for (let i = 0; i < locations.length; i++) {
    const current = locations[i];
    const next = locations[i + 1];

    if (!next) {
      slices.push(getRectangleCoordinates(first, last));
      break;
    }

    if (current.latitude === next.latitude) {
      if (next.longitude - current.longitude < gridDistanceAtLatitude(current.latitude) + Earth.SLICE_OFFSET) {
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

export function getSquareEdges(location) {
  const coordinates = getSquareCoordinates(location);
  return [
    [coordinates[0], coordinates[1]],
    [coordinates[1], coordinates[2]],
    [coordinates[3], coordinates[2]],
    [coordinates[0], coordinates[3]],
  ];
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
