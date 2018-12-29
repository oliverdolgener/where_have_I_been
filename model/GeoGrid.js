import GeoLocation from './GeoLocation';
import GeoArray from './GeoArray';
import * as Earth from '../constants/Earth';

export default class GeoGrid {
  constructor() {
    this.geoGrid = [];
  }

  static contains(location, grid) {
    const row = grid.find(x => x.latitude == location.latitude);
    if (row) {
      return row.locations.find(x => x.longitude == location.longitude);
    }
    return false;
  }

  static toArray(grid) {
    const rows = grid.map(x => x.locations);
    const locations = [].concat(...rows);
    return locations.map(x => new GeoLocation(x.latitude, x.longitude, x.timestamp));
  }

  static insert(location, grid) {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i].latitude == location.latitude) {
        const row = grid[i].locations;
        for (let k = 0; k < row.length; k++) {
          if (row[k].longitude > location.longitude) {
            grid[i].locations.splice(k, 0, location);
            return grid;
          }
          grid[i].locations.push(location);
          return grid;
        }
      }

      if (grid[i].latitude > location.latitude) {
        grid.splice(i, 0, {
          latitude: location.latitude,
          locations: [location],
        });
        return grid;
      }
    }

    grid.push({
      latitude: location.latitude,
      locations: [location],
    });
    return grid;
  }

  static remove(location, grid) {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i].latitude == location.latitude) {
        const row = grid[i].locations;
        for (let k = 0; k < row.length; k++) {
          if (row[k].longitude == location.longitude) {
            grid[i].locations.splice(k, 1);
            return grid;
          }
        }
      }
    }
    return grid;
  }

  static getRectangleSlices(grid, gridDistance = Earth.GRID_DISTANCE) {
    const slices = [];
    const array = GeoGrid.toArray(grid);
    const resizedLocations = GeoArray.removeDuplicates(
      array.map(x => x.getRoundedLocation(gridDistance)),
    );
    const locations = GeoArray.toGrid(resizedLocations);

    for (let i = 0; i < locations.length; i++) {
      const row = locations[i].locations;
      let first = row[0];
      let last = row[0];
      for (let k = 0; k < row.length; k++) {
        const current = row[k];
        const next = row[k + 1];

        if (next) {
          if (
            next.longitude - current.longitude
            < GeoLocation.gridDistanceAtLatitude(current.latitude, gridDistance) + Earth.SLICE_OFFSET
          ) {
            last = next;
          } else {
            slices.push(GeoLocation.getRectangle(first, last, gridDistance));
            first = next;
            last = next;
          }
        } else {
          slices.push(GeoLocation.getRectangle(first, last, gridDistance));
        }
      }
    }

    return slices;
  }

  static getDiamondSlices(grid, gridDistance = Earth.GRID_DISTANCE) {
    const slices = [];
    const array = GeoGrid.toArray(grid);
    const resizedLocations = GeoArray.removeDuplicates(
      array.map(x => x.getRoundedLocation(gridDistance)),
    );
    const locations = GeoArray.toGrid(resizedLocations);

    for (let i = 0; i < locations.length; i++) {
      const row = locations[i].locations;
      let first = row[0];
      let last = row[0];
      for (let k = 0; k < row.length; k++) {
        const current = row[k];
        const next = row[k + 1];

        if (next) {
          if (
            next.longitude - current.longitude
            < GeoLocation.gridDistanceAtLatitude(current.latitude, gridDistance) + Earth.SLICE_OFFSET
          ) {
            last = next;
          } else {
            slices.push(GeoLocation.getDiamond(first, last, gridDistance));
            first = next;
            last = next;
          }
        } else {
          slices.push(GeoLocation.getDiamond(first, last, gridDistance));
        }
      }
    }

    return slices;
  }

  static getVisibleLocations(locations, region) {
    const visibleLocations = [];
    locations.forEach((x) => {
      if (GeoLocation.isLatitudeInRegion(x.latitude, region, 2)) {
        const row = {
          latitude: x.latitude,
          locations: [],
        };

        x.locations.forEach((y) => {
          if (GeoLocation.isLongitudeInRegion(y.longitude, region, 2)) {
            row.locations.push(y);
          }
        });

        if (row.locations.length > 0) {
          visibleLocations.push(row);
        }
      }
    });

    return visibleLocations;
  }

  contains = location => GeoGrid.contains(location, this);

  toArray = () => GeoGrid.toArray(this);

  insert = location => GeoGrid.insert(location, this);

  remove = location => GeoGrid.remove(location, this);

  getSlices = (gridDistance = Earth.GRID_DISTANCE) => GeoGrid.getSlices(this, gridDistance);

  getVisibleLocations = region => GeoGrid.getVisibleLocations(this, region);
}
