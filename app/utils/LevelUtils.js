export function getExpForLevel(level) {
  return level ** 3;
}

export function getLevelFromExp(exp) {
  return Math.floor(Math.cbrt(exp));
}

export function getExpToNextLevel(exp) {
  const currentlevel = getLevelFromExp(exp);
  const nextLevel = currentlevel + 1;
  const nextLevelExp = getExpForLevel(nextLevel);
  return nextLevelExp - exp;
}

export function getPercentToNextLevel(exp) {
  const currentlevel = getLevelFromExp(exp);
  const nextLevel = currentlevel + 1;
  return 1 - getExpToNextLevel(exp) / (getExpForLevel(nextLevel) - getExpForLevel(currentlevel));
}
