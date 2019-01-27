import GeoArray from './GeoArray';
import * as ConversionUtils from '../utils/ConversionUtils';
import * as RoundUtils from '../utils/RoundUtils';
import * as Earth from '../constants/Earth';

export default class GeoLocation {
  static circumferenceAtLatitude(latitude) {
    return 2 * Math.PI * Earth.EARTH_RADIUS * Math.cos(ConversionUtils.toRadians(latitude));
  }

  static pointsAtLatitude(latitude, gridDistance = Earth.GRID_DISTANCE) {
    const rounded = Math.round((360 / gridDistance) * Math.cos(ConversionUtils.toRadians(latitude)));
    return rounded < 1 ? 1 : rounded;
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
    return {
      latitude,
      longitude,
      timestamp: location.timestamp,
    };
  }

  static getRectangle(left, right, gridDistance = Earth.GRID_DISTANCE) {
    const centerLatitude = left.latitude;
    const centerGridDistance = GeoLocation.gridDistanceAtLatitude(centerLatitude, gridDistance);
    const horizontalOffset = centerGridDistance / Earth.SQUARE_OFFSET;
    const verticalOffset = gridDistance / Earth.SQUARE_OFFSET;

    const topLeft = {
      latitude: left.latitude + verticalOffset,
      longitude: left.longitude - horizontalOffset,
    };
    const topRight = {
      latitude: right.latitude + verticalOffset,
      longitude: right.longitude + horizontalOffset,
    };
    const botRight = {
      latitude: right.latitude - verticalOffset,
      longitude: right.longitude + horizontalOffset,
    };
    const botLeft = {
      latitude: left.latitude - verticalOffset,
      longitude: left.longitude - horizontalOffset,
    };
    return [topLeft, topRight, botRight, botLeft];
  }

  static getRoundedRectangle(left, right, gridDistance = Earth.GRID_DISTANCE) {
    const centerLatitude = left.latitude;
    const centerGridDistance = GeoLocation.gridDistanceAtLatitude(centerLatitude, gridDistance);
    const horizontalOffset = centerGridDistance / Earth.SQUARE_OFFSET;
    const verticalOffset = gridDistance / Earth.SQUARE_OFFSET;

    const radiusVertical = gridDistance / 10;
    const radiusHorizontal = GeoLocation.gridDistanceAtLatitude(centerLatitude, radiusVertical);
    const count = 16;
    const points = [];

    const topLeft = {
      latitude: left.latitude + verticalOffset - radiusVertical,
      longitude: left.longitude - horizontalOffset + radiusHorizontal,
    };
    const topRight = {
      latitude: right.latitude + verticalOffset - radiusVertical,
      longitude: right.longitude + horizontalOffset - radiusHorizontal,
    };
    const botRight = {
      latitude: right.latitude - verticalOffset + radiusVertical,
      longitude: right.longitude + horizontalOffset - radiusHorizontal,
    };
    const botLeft = {
      latitude: left.latitude - verticalOffset + radiusVertical,
      longitude: left.longitude - horizontalOffset + radiusHorizontal,
    };

    for (let i = count / 2; i >= count / 4; i--) {
      const latitude = topLeft.latitude + radiusVertical * Math.sin(((2 * Math.PI) / count) * i);
      const longitude = topLeft.longitude + radiusHorizontal * Math.cos(((2 * Math.PI) / count) * i);
      points.push({ latitude, longitude });
    }

    for (let i = count / 4; i >= 0; i--) {
      const latitude = topRight.latitude + radiusVertical * Math.sin(((2 * Math.PI) / count) * i);
      const longitude = topRight.longitude + radiusHorizontal * Math.cos(((2 * Math.PI) / count) * i);
      points.push({ latitude, longitude });
    }

    for (let i = count; i >= count * 3 / 4; i--) {
      const latitude = botRight.latitude + radiusVertical * Math.sin(((2 * Math.PI) / count) * i);
      const longitude = botRight.longitude + radiusHorizontal * Math.cos(((2 * Math.PI) / count) * i);
      points.push({ latitude, longitude });
    }

    for (let i = count * 3 / 4; i >= count / 2; i--) {
      const latitude = botLeft.latitude + radiusVertical * Math.sin(((2 * Math.PI) / count) * i);
      const longitude = botLeft.longitude + radiusHorizontal * Math.cos(((2 * Math.PI) / count) * i);
      points.push({ latitude, longitude });
    }

    return points;
  }

  static getDiamond(left, right, gridDistance = Earth.GRID_DISTANCE) {
    const centerLatitude = left.latitude;
    const centerGridDistance = GeoLocation.gridDistanceAtLatitude(centerLatitude, gridDistance);
    const centerLongitudeLeft = left.longitude - centerGridDistance / 2;
    const centerLongitudeRight = right.longitude + centerGridDistance / 2;

    const topLatitude = GeoLocation.getRoundedLatitude(centerLatitude + gridDistance, gridDistance);
    const topGridDistance = GeoLocation.gridDistanceAtLatitude(topLatitude, gridDistance);
    const topLongitudeLeft = GeoLocation.getRoundedLongitude(
      left.longitude,
      topLatitude,
      gridDistance,
    );
    const topLongitudeRight = GeoLocation.getRoundedLongitude(
      right.longitude,
      topLatitude,
      gridDistance,
    );

    const botLatitude = GeoLocation.getRoundedLatitude(centerLatitude - gridDistance, gridDistance);
    const botGridDistance = GeoLocation.gridDistanceAtLatitude(botLatitude, gridDistance);
    const botLongitudeLeft = GeoLocation.getRoundedLongitude(
      left.longitude,
      botLatitude,
      gridDistance,
    );
    const botLongitudeRight = GeoLocation.getRoundedLongitude(
      right.longitude,
      botLatitude,
      gridDistance,
    );

    const topLeftLongitude = (centerLongitudeLeft + topLongitudeLeft - topGridDistance / 2) / 2;
    const topRightLongitude = (centerLongitudeRight + topLongitudeRight + topGridDistance / 2) / 2;
    const botRightLongitude = (centerLongitudeRight + botLongitudeRight + botGridDistance / 2) / 2;
    const botLeftLongitude = (centerLongitudeLeft + botLongitudeLeft - botGridDistance / 2) / 2;

    const verticalOffset = gridDistance / Earth.SQUARE_OFFSET;

    const topLeft = {
      latitude: left.latitude + verticalOffset,
      longitude: topLeftLongitude,
    };
    const topRight = {
      latitude: right.latitude + verticalOffset,
      longitude: topRightLongitude,
    };
    const botRight = {
      latitude: right.latitude - verticalOffset,
      longitude: botRightLongitude,
    };
    const botLeft = {
      latitude: left.latitude - verticalOffset,
      longitude: botLeftLongitude,
    };
    return [topLeft, topRight, botRight, botLeft];
  }

  static getSquare = (location, gridDistance = Earth.GRID_DISTANCE) => GeoLocation.getRectangle(location, location, gridDistance);

  static getCircle(center, radius, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const latitude = center.latitude + radius * Math.sin(((2 * Math.PI) / count) * i);
      const longitude = center.longitude
        + GeoLocation.gridDistanceAtLatitude(latitude, radius)
          * Math.cos(((2 * Math.PI) / count) * i);
      points.push({
        latitude,
        longitude,
        timestamp: center.timestamp,
      });
    }
    return points;
  }

  static getCircleTiles(center, radius, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const latitude = center.latitude + radius * Math.sin(((2 * Math.PI) / count) * i);
      const longitude = center.longitude
        + GeoLocation.gridDistanceAtLatitude(latitude, radius)
          * Math.cos(((2 * Math.PI) / count) * i);
      const tile = GeoLocation.getRoundedLocation({ latitude, longitude });
      points.push({
        latitude: tile.latitude,
        longitude: tile.longitude,
        timestamp: center.timestamp,
      });
    }
    return GeoArray.removeDuplicates(points);
  }

  static isLatitudeInRegion(latitude, region, factor = 1) {
    const borderTop = region.latitude + region.latitudeDelta / (2 / factor);
    const borderBottom = region.latitude - region.latitudeDelta / (2 / factor);
    return latitude <= borderTop && latitude >= borderBottom;
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
}
