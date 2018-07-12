export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

Math.degrees = function(radians) {
  return (radians * 180) / Math.PI;
};

export function roundToMultiples(value, multiples) {
  return Math.round(value / multiples) * multiples;
}

export function roundToDecimals(value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function round(value, decimals, multiples = 1) {
  return roundToMultiples(value * Math.pow(10, decimals), multiples) / Math.pow(10, decimals);
}
