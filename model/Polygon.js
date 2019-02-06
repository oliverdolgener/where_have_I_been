import Region2D from 'region2d';

import Point from './Point';
import LatLng from './LatLng';

export default class Polygon {
  static isSolid(polygon) {
    let sum = 0;
    for (let i = 0; i < polygon.length; i++) {
      const next = i + 1 >= polygon.length ? 0 : i + 1;
      sum
        += (polygon[next].longitude - polygon[i].longitude)
        * (polygon[next].latitude + polygon[i].latitude);
    }
    return sum > 0;
  }

  static isPointInside(coordinate, polygon) {
    // polygon[i+1] must be === polygon[0]
    let crossings = 0;

    for (let i = 0; i < polygon.length - 1; i++) {
      if (
        (polygon[i].latitude <= coordinate.latitude
          && polygon[i + 1].latitude > coordinate.latitude)
        || (polygon[i].latitude > coordinate.latitude
          && polygon[i + 1].latitude <= coordinate.latitude)
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

  static normalize(slice) {
    console.log(slice);
    const topLeft = LatLng.toPoint({ latitude: slice[0].latitude, longitude: slice[0].longitude });
    const botRight = LatLng.toPoint({ latitude: slice[2].latitude, longitude: slice[2].longitude });
    return [topLeft.x, topLeft.y, botRight.x, botRight.y];
  }

  static denormalize(array) {
    return array.map(e => Point.toLatLngRounded(e));
  }

  static pathToPolygons(path) {
    return path.map(x => Polygon.denormalize(x));
  }

  static getPolygons(slices) {
    if (slices.length < 1) {
      return [];
    }
    let union = new Region2D(Polygon.normalize(slices[0]));
    for (let i = 1; i < slices.length; i++) {
      union = union.union(new Region2D(Polygon.normalize(slices[i])));
    }
    return Polygon.pathToPolygons(union.getPath());
  }
}
