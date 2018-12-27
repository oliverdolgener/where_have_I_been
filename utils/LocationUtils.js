import * as Earth from '../constants/Earth';

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
