import GeoLocation from './GeoLocation';
import GeoArray from './GeoArray';
import * as Earth from '../constants/Earth';

export default class GeoGrid {
  static contains(location, grid) {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i].latitude == location.latitude) {
        const row = grid[i].locations;
        for (let k = 0; k < row.length; k++) {
          if (row[k].longitude == location.longitude) {
            return row[k];
          }
        }
      }
    }
    return false;
  }

  static toArray(grid) {
    const rows = grid.map(x => x.locations);
    const locations = [].concat(...rows);
    return locations.map(x => ({
      latitude: x.latitude,
      longitude: x.longitude,
      timestamp: x.timestamp,
    }));
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

  static getRectangleSlices(array, gridDistance = Earth.GRID_DISTANCE) {
    const slices = [];
    const resizedLocations = GeoArray.removeDuplicates(
      array.map(x => GeoLocation.getRoundedLocation(x, gridDistance)),
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

  static getDiamondSlices(array, gridDistance = Earth.GRID_DISTANCE) {
    const slices = [];
    const resizedLocations = GeoArray.removeDuplicates(
      array.map(x => GeoLocation.getRoundedLocation(x, gridDistance)),
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

  static getVisibleLocations(grid, region) {
    const visibleLocations = [];
    for (let i = 0; i < grid.length; i++) {
      if (GeoLocation.isLatitudeInRegion(grid[i].latitude, region, 2)) {
        const row = grid[i].locations;
        const newRow = {
          latitude: row.latitude,
          locations: [],
        };
        for (let k = 0; k < row.length; k++) {
          if (GeoLocation.isLongitudeInRegion(row[k].longitude, region, 2)) {
            newRow.locations.push(row[k]);
          }
        }
        if (newRow.locations.length > 0) {
          visibleLocations.push(newRow);
        }
      }
    }
    return visibleLocations;
  }
}
