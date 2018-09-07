import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';

export default class Coordinate {
  constructor(latitude, longitude, timestamp) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.timestamp = timestamp;
  }

  static isEqual(coordinateA, coordinateB) {
    return (
      coordinateA.latitude === coordinateB.latitude &&
      coordinateA.longitude === coordinateB.longitude
    );
  }

  static getRoundedLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
    return MathUtils.roundToDecimals(Math.round(latitude / gridDistance) * gridDistance, 6);
  }

  static getRoundedLongitude(longitude, latitude, gridDistance = Earth.GRID_DISTANCE) {
    const roundedLatitude = Coordinate.getRoundedLatitude(latitude, gridDistance);
    return MathUtils.roundToDecimals(
      Math.round(longitude / EarthUtils.gridDistanceAtLatitude(roundedLatitude, gridDistance)) *
        EarthUtils.gridDistanceAtLatitude(roundedLatitude, gridDistance),
      6,
    );
  }

  static isCoordinateInRegion(coordinate, region, factor = 1) {
    return (
      coordinate.latitude <= region.latitude + region.latitudeDelta / (2 / factor) &&
      coordinate.latitude >= region.latitude - region.latitudeDelta / (2 / factor) &&
      coordinate.longitude <= region.longitude + region.longitudeDelta / (2 / factor) &&
      coordinate.longitude >= region.longitude - region.longitudeDelta / (2 / factor)
    );
  }

  static getNeighbours(coordinate, array, gridDistance = Earth.GRID_DISTANCE) {
    const neighbouringRows = array.filter(x => x.latitude === coordinate.latitude || x.latitude === coordinate.latitude + gridDistance || x.latitude === coordinate.latitude - gridDistance);
    return MathUtils.gridToArray(neighbouringRows).filter(x => (x.longitude - coordinate.longitude) ** 2 / EarthUtils.gridDistanceAtLatitude(coordinate.latitude) ** 2 <= Earth.NEIGHBOUR_BOUNDARY + Earth.NEIGHBOUR_OFFSET_LONG && !Coordinate.isEqual(x, coordinate));
  }

  static breadthFirstSearch(array, start) {
    if (array.length < 1) {
      return [];
    }

    if (array.length === 1) {
      return array;
    }

    array.forEach(x => (x.visited = false));
    const BFS = [];
    const queue = [];
    const startTile = array.find(x => Coordinate.isEqual(x, start));
    startTile.visited = true;
    queue.push(startTile);
    BFS.push(startTile);

    while (queue.length > 0) {
      const tile = queue.shift();
      const neighbours = Coordinate.getNeighbours(tile, array);
      neighbours.forEach((x) => {
        if (!x.visited) {
          x.visited = true;
          queue.push(x);
          BFS.push(x);
        }
      });
    }

    return BFS;
  }

  static getCoherentTiles(array) {
    if (array.length < 1) {
      return [];
    }

    if (array.length === 1) {
      return array;
    }

    const coherentTiles = [];
    array.forEach(x => (x.visited = false));

    for (let i = 0; i < array.length; i++) {
      if (!array[i].visited) {
        const BFS = [];
        const queue = [];
        const startTile = array.find(x => Coordinate.isEqual(x, array[i]));
        startTile.visited = true;
        queue.push(startTile);
        BFS.push(startTile);

        while (queue.length > 0) {
          const tile = queue.shift();
          const neighbours = Coordinate.getNeighbours(tile, array);
          neighbours.forEach((x) => {
            if (!x.visited) {
              x.visited = true;
              queue.push(x);
              BFS.push(x);
            }
          });
        }
        coherentTiles.push(BFS);
      }
    }

    return coherentTiles;
  }

  static getDistance(pointA, pointB) {
    const phi1 = MathUtils.toRadians(pointA.latitude);
    const phi2 = MathUtils.toRadians(pointB.latitude);
    const deltaPhi = MathUtils.toRadians(pointB.latitude - pointA.latitude);
    const deltaLambda = MathUtils.toRadians(pointB.longitude - pointA.longitude);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Earth.EARTH_RADIUS * c;
  }

  getDistance(point) {
    return Coordinate.getDistance(this, point);
  }

  getRoundedLatitude() {
    return Coordinate.getRoundedLatitude(this.latitude);
  }

  getRoundedLongitude() {
    return Coordinate.getRoundedLongitude(this.longitude, this.latitude);
  }

  isInRegion(region, factor = 1) {
    const coordinate = new Coordinate(this.latitude, this.longitude, this.timestamp);
    return Coordinate.isCoordinateInRegion(coordinate, region, factor);
  }

  getCorners(gridDistance = Earth.GRID_DISTANCE) {
    return [
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude -
            EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET -
            Earth.ROUND_OFFSET_LONG,
          6,
        ),
      ),
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude + EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET,
          6,
        ),
      ),
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude - gridDistance / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude + EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET,
          6,
        ),
      ),
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude - gridDistance / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude -
            EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET -
            Earth.ROUND_OFFSET_LONG,
          6,
        ),
      ),
    ];
  }
}
