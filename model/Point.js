export default class Point {
  constructor(x, y) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
  }

  static toLatLng(point) {
    return {
      latitude: parseFloat(point.y) * -1 + 90,
      longitude: parseFloat(point.x) - 180,
    };
  }

  toLatLng() {
    return this.toLatLng(this);
  }
}
