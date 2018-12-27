import * as ConversionUtils from '../utils/ConversionUtils';
import * as RoundUtils from '../utils/RoundUtils';
import * as Earth from '../constants/Earth';

export default class GeoLocation {
  constructor(latitude, longitude, timestamp = null) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.timestamp = timestamp;
  }

  static circumferenceAtLatitude(latitude) {
    return 2 * Math.PI * Earth.EARTH_RADIUS * Math.cos(ConversionUtils.toRadians(latitude));
  }

  static pointsAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
    return Math.round((360 / gridDistance) * Math.cos(ConversionUtils.toRadians(latitude)));
  }

  static gridDistanceAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
    return 360 / GeoLocation.pointsAtLatitude(latitude, gridDistance);
  }

  static isEqual = (a, b) => a.latitude == b.latitude && a.longitude == b.longitude;

  static getRoundedLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
    return RoundUtils.roundToDecimals(Math.round(latitude / gridDistance) * gridDistance, 6);
  }

  static getRoundedLongitude(longitude, latitude, gridDistance = Earth.GRID_DISTANCE) {
    const roundedLatitude = GeoLocation.getRoundedLatitude(latitude, gridDistance);
    return RoundUtils.roundToDecimals(
      Math.round(longitude / GeoLocation.gridDistanceAtLatitude(roundedLatitude, gridDistance))
        * GeoLocation.gridDistanceAtLatitude(roundedLatitude, gridDistance),
      6,
    );
  }

  static getRoundedLocation(location, gridDistance = Earth.gridDistance) {
    const latitude = GeoLocation.getRoundedLatitude(location.latitude, gridDistance);
    const longitude = GeoLocation.getRoundedLongitude(location.longitude, latitude, gridDistance);
    return new GeoLocation(latitude, longitude, location.timestamp);
  }

  static getRectangle(topLeft, botRight, gridDistance = Earth.GRID_DISTANCE) {
    const { latitude } = topLeft;
    const topTopLatitude = GeoLocation.getRoundedLatitude(latitude + gridDistance, gridDistance);
    const botBotLatitude = GeoLocation.getRoundedLatitude(latitude - gridDistance, gridDistance);
    const topLatitude = RoundUtils.roundToDecimals(
      topLeft.latitude + gridDistance / Earth.SQUARE_OFFSET,
      6,
    );
    const botLatitude = RoundUtils.roundToDecimals(
      botRight.latitude - gridDistance / Earth.SQUARE_OFFSET,
      6,
    );
    const topLeftLongitude = GeoLocation.getRoundedLongitude(
      topLeft.longitude,
      topTopLatitude,
      gridDistance,
    );
    const topRightLongitude = GeoLocation.getRoundedLongitude(
      botRight.longitude,
      topTopLatitude,
      gridDistance,
    );
    const botRightLongitude = GeoLocation.getRoundedLongitude(
      botRight.longitude,
      botBotLatitude,
      gridDistance,
    );
    const botLeftLongitude = GeoLocation.getRoundedLongitude(
      topLeft.longitude,
      botBotLatitude,
      gridDistance,
    );
    const topLongitude = GeoLocation.getRoundedLongitude(
      topLeft.longitude + GeoLocation.gridDistanceAtLatitude(topLatitude, gridDistance),
      topLatitude,
      gridDistance,
    );
    const topLeftCorner = {
      latitude: topLatitude,
      longitude: RoundUtils.roundToDecimals(
        topLeftLongitude
          - GeoLocation.gridDistanceAtLatitude(topLeft.latitude, gridDistance) / Earth.SQUARE_OFFSET
          - Earth.ROUND_OFFSET_LONG,
        6,
      ),
    };
    const topRightCorner = {
      latitude: topLatitude,
      longitude: RoundUtils.roundToDecimals(
        topRightLongitude
          + GeoLocation.gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    };
    const botRightCorner = {
      latitude: botLatitude,
      longitude: RoundUtils.roundToDecimals(
        botRight.longitude
          + GeoLocation.gridDistanceAtLatitude(botRight.latitude, gridDistance) / Earth.SQUARE_OFFSET,
        6,
      ),
    };
    const botLeftCorner = {
      latitude: botLatitude,
      longitude: RoundUtils.roundToDecimals(
        topLeft.longitude
          - GeoLocation.gridDistanceAtLatitude(topLeft.latitude, gridDistance) / Earth.SQUARE_OFFSET
          - Earth.ROUND_OFFSET_LONG,
        6,
      ),
    };
    return [topLeftCorner, topRightCorner, botRightCorner, botLeftCorner];
  }

  static getSquare = (location, gridDistance = Earth.GRID_DISTANCE) => GeoLocation.getRectangle(location, location, gridDistance);

  static getCircle(center, radius, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const latitude = center.latitude + radius * Math.sin(((2 * Math.PI) / count) * i);
      const longitude = center.longitude
        + GeoLocation.gridDistanceAtLatitude(latitude, radius)
          * Math.cos(((2 * Math.PI) / count) * i);
      points.push(new GeoLocation(latitude, longitude, center.timestamp));
    }
    return points;
  }

  static isLatitudeInRegion(latitude, region, factor = 1) {
    const borderTop = region.latitude + region.latitudeDelta / (2 / factor);
    const borderTopBottom = region.latitude - region.latitudeDelta / (2 / factor);
    return latitude <= borderTop && latitude >= borderTopBottom;
  }

  static isLongitudeInRegion(longitude, region, factor = 1) {
    const borderRight = region.longitude + region.longitudeDelta / (2 / factor);
    const borderLeft = region.longitude - region.longitudeDelta / (2 / factor);

    if (borderRight > 180) {
      const isInLeftHalf = longitude >= borderLeft && longitude <= 180;
      const isInRightHalf = longitude <= borderRight - 360 && longitude >= -180;
      return isInLeftHalf || isInRightHalf;
    }

    if (borderLeft < -180) {
      const isInLeftHalf = longitude >= borderLeft + 360 && longitude <= 180;
      const isInRightHalf = longitude <= borderRight && longitude >= -180;
      return isInLeftHalf || isInRightHalf;
    }

    return longitude <= borderRight && longitude >= borderLeft;
  }

  static isInRegion(location, region, factor = 1) {
    return (
      GeoLocation.isLatitudeInRegion(location.latitude, region, factor)
      && GeoLocation.isLongitudeInRegion(location.longitude, region, factor)
    );
  }

  isEqual = geolocation => GeoLocation.isEqual(this, geolocation);

  getRoundedLatitude = (gridDistance = Earth.GRID_DISTANCE) => GeoLocation.getRoundedLatitude(this.latitude, gridDistance);

  getRoundedLongitude = (gridDistance = Earth.GRID_DISTANCE) => GeoLocation.getRoundedLongitude(this.longitude, this.latitude, gridDistance);

  getRoundedLocation = (gridDistance = Earth.GRID_DISTANCE) => GeoLocation.getRoundedLocation(this, gridDistance);

  getSquare = (gridDistance = Earth.GRID_DISTANCE) => GeoLocation.getRectangle(this, this, gridDistance);

  getCircle = (radius, count) => GeoLocation.getCircle(this, radius, count);

  isLatitudeInRegion = (region, factor = 1) => GeoLocation.isLatitudeInRegion(this.latitude, region, factor);

  isLongitudeInRegion = (region, factor = 1) => GeoLocation.isLongitudeInRegion(this.longitude, region, factor);

  isInRegion = (region, factor = 1) => GeoLocation.isLatitudeInRegion(this, region, factor);
}
