import * as LocationUtils from '../utils/LocationUtils';
import * as RoundUtils from '../utils/RoundUtils';
import * as Earth from '../constants/Earth';

export default class Geolocation {
  constructor(latitude, longitude, timestamp) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.timestamp = timestamp;
  }

  static isEqual(coordinateA, coordinateB) {
    return (
      coordinateA.latitude === coordinateB.latitude
      && coordinateA.longitude === coordinateB.longitude
    );
  }

  static getRoundedLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
    return RoundUtils.roundToDecimals(Math.round(latitude / gridDistance) * gridDistance, 6);
  }

  static getRoundedLongitude(longitude, latitude, gridDistance = Earth.GRID_DISTANCE) {
    const roundedLatitude = Geolocation.getRoundedLatitude(latitude, gridDistance);
    return RoundUtils.roundToDecimals(
      Math.round(longitude / LocationUtils.gridDistanceAtLatitude(roundedLatitude, gridDistance))
        * LocationUtils.gridDistanceAtLatitude(roundedLatitude, gridDistance),
      6,
    );
  }

  static getNeighbours(coordinate, array, gridDistance = Earth.GRID_DISTANCE) {
    const neighbouringRows = array.filter(
      x => x.latitude === coordinate.latitude
        || x.latitude === coordinate.latitude + gridDistance
        || x.latitude === coordinate.latitude - gridDistance,
    );
    return LocationUtils.gridToArray(neighbouringRows).filter(
      x => (x.longitude - coordinate.longitude) ** 2
          / LocationUtils.gridDistanceAtLatitude(coordinate.latitude) ** 2
          <= Earth.NEIGHBOUR_BOUNDARY + Earth.NEIGHBOUR_OFFSET_LONG
        && !Geolocation.isEqual(x, coordinate),
    );
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
    const startTile = array.find(x => Geolocation.isEqual(x, start));
    startTile.visited = true;
    queue.push(startTile);
    BFS.push(startTile);

    while (queue.length > 0) {
      const tile = queue.shift();
      const neighbours = Geolocation.getNeighbours(tile, array);
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
        const startTile = array.find(x => Geolocation.isEqual(x, array[i]));
        startTile.visited = true;
        queue.push(startTile);
        BFS.push(startTile);

        while (queue.length > 0) {
          const tile = queue.shift();
          const neighbours = Geolocation.getNeighbours(tile, array);
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
    return Geolocation.getRoundedLatitude(this.latitude);
  }

  getRoundedLongitude() {
    return Geolocation.getRoundedLongitude(this.longitude, this.latitude);
  }

  getCorners(gridDistance = Earth.GRID_DISTANCE) {
    return [
      new Geolocation(
        RoundUtils.roundToDecimals(this.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
        RoundUtils.roundToDecimals(
          this.longitude
            - LocationUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET
            - Earth.ROUND_OFFSET_LONG,
          6,
        ),
      ),
      new Geolocation(
        RoundUtils.roundToDecimals(this.latitude + gridDistance / Earth.SQUARE_OFFSET, 6),
        RoundUtils.roundToDecimals(
          this.longitude
            + LocationUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET,
          6,
        ),
      ),
      new Geolocation(
        RoundUtils.roundToDecimals(this.latitude - gridDistance / Earth.SQUARE_OFFSET, 6),
        RoundUtils.roundToDecimals(
          this.longitude
            + LocationUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET,
          6,
        ),
      ),
      new Geolocation(
        RoundUtils.roundToDecimals(this.latitude - gridDistance / Earth.SQUARE_OFFSET, 6),
        RoundUtils.roundToDecimals(
          this.longitude
            - LocationUtils.gridDistanceAtLatitude(this.latitude) / Earth.SQUARE_OFFSET
            - Earth.ROUND_OFFSET_LONG,
          6,
        ),
      ),
    ];
  }
}
