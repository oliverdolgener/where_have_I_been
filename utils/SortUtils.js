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
