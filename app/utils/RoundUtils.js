export function roundToMultiples(value, multiples) {
  return Math.round(value / multiples) * multiples;
}

export function roundToDecimals(value, decimals) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export function round(value, decimals, multiples = 1) {
  return roundToMultiples(value * 10 ** decimals, multiples) / 10 ** decimals;
}
