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

  static getRoundedLatitude(latitude) {
    return MathUtils.roundToDecimals(
      Math.round(latitude / Earth.GRID_DISTANCE) * Earth.GRID_DISTANCE,
      6,
    );
  }

  static getRoundedLongitude(longitude, latitude) {
    const roundedLatitude = Coordinate.getRoundedLatitude(latitude);
    return MathUtils.roundToDecimals(
      Math.round(longitude / EarthUtils.gridDistanceAtLatitude(roundedLatitude)) *
        EarthUtils.gridDistanceAtLatitude(roundedLatitude),
      6,
    );
  }

  static isCoordinateInRegion(coordinate, region) {
    return (
      coordinate.latitude <= region.latitude + region.latitudeDelta &&
      coordinate.latitude >= region.latitude - region.latitudeDelta &&
      coordinate.longitude <= region.longitude + region.longitudeDelta &&
      coordinate.longitude >= region.longitude - region.longitudeDelta
    );
  }

  static getNeighbours(coordinate, array) {
    const neighbours = [];
    array.forEach((x) => {
      if (
        (x.latitude - coordinate.latitude) ** 2 / Earth.GRID_DISTANCE ** 2 <= Earth.NEIGHBOUR_BOUNDARY + Earth.NEIGHBOUR_OFFSET_LAT &&
        (x.longitude - coordinate.longitude) ** 2 / EarthUtils.gridDistanceAtLatitude(coordinate.latitude) ** 2 <= Earth.NEIGHBOUR_BOUNDARY + Earth.NEIGHBOUR_OFFSET_LONG
      ) {
        if (!Coordinate.isEqual(x, coordinate)) {
          neighbours.push(x);
        }
      }
    });
    return neighbours;
  }

  static breadFirstSearch(array, start) {
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

  getRoundedLatitude() {
    return Coordinate.getRoundedLatitude(this.latitude);
  }

  getRoundedLongitude() {
    return Coordinate.getRoundedLongitude(this.longitude, this.latitude);
  }

  isInRegion(region) {
    return (
      this.latitude <= region.latitude + region.latitudeDelta &&
      this.latitude >= region.latitude - region.latitudeDelta &&
      this.longitude <= region.longitude + region.longitudeDelta &&
      this.longitude >= region.longitude - region.longitudeDelta
    );
  }

  getCorners() {
    return [
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude + Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude -
            EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET -
            0.000001,
          6,
        ),
      ),
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude + Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude + EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET,
          6,
        ),
      ),
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude - Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude + EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET,
          6,
        ),
      ),
      new Coordinate(
        MathUtils.roundToDecimals(this.latitude - Earth.GRID_DISTANCE / Earth.SQUARE_OFFSET, 6),
        MathUtils.roundToDecimals(
          this.longitude -
            EarthUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET -
            0.000001,
          6,
        ),
      ),
    ];
  }
}
