export function byLatitudeAsc(a, b) {
  const lat1 = a.latitude;
  const lat2 = b.latitude;

  if (lat1 === lat2) {
    const long1 = a.longitude;
    const long2 = b.longitude;
    return long1 - long2;
  }

  return lat1 - lat2;
}

export function byLatitudeDesc(a, b) {
  const lat1 = a.latitude;
  const lat2 = b.latitude;

  if (lat1 === lat2) {
    const long1 = a.longitude;
    const long2 = b.longitude;
    return long1 - long2;
  }

  return lat2 - lat1;
}

export function byStatusAsc(a, b) {
  if (a.status === b.status) {
    return a.name - b.name;
  }
  return a.status - b.status;
}

export function byStatusDesc(a, b) {
  if (a.status === b.status || ((!a.status || a.status === 0) && (!b.status || b.status === 0))) {
    return a.name.localeCompare(b.name);
  }
  return b.status - a.status;
}
