export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

export function toKmh(ms) {
  return ms * 3.6;
}

export function toMs(kmh) {
  return kmh / 3.6;
}
