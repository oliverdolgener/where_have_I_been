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
