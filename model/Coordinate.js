import * as MathUtils from '../utils/MathUtils';
import * as EarthUtils from '../utils/EarthUtils';
import * as Earth from '../constants/Earth';

export default class Coordinate {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
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

  getRoundedLatitude() {
    return Coordinate.getRoundedLatitude(this.latitude);
  }

  getRoundedLongitude() {
    return Coordinate.getRoundedLongitude(this.longitude, this.latitude);
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
