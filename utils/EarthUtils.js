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
