export function roundToMultiples(value, multiples) {
  return Math.round(value / multiples) * multiples;
};

export function round(value, decimals, multiples = 1) {
  return roundToMultiples(value * Math.pow(10, decimals), multiples) / (Math.pow(10, decimals));
};
