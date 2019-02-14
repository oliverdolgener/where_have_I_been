export default class LatLng {
  constructor(latitude, longitude) {
    this.latitude = parseFloat(latitude);
    this.longitude = parseFloat(longitude);
  }

  static toPoint(latlng) {
    return {
      x: parseFloat(latlng.longitude) + 180,
      y: parseFloat(latlng.latitude) * -1 + 90,
    };
  }

  toPoint() {
    return this.toPoint(this);
  }
}
