import React from 'react';
import { View } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import * as LocationUtils from '../utils/LocationUtils';
import * as Colors from '../constants/Colors';
import * as Earth from '../constants/Earth';

const Fog = (props) => {
  const { region, visitedLocations, friendLocations } = props;

  const visibleLocations = LocationUtils.filterVisibleLocations(
    friendLocations || visitedLocations,
    region,
    2,
  );
  const gridDistance = LocationUtils.getGridDistanceByRegion(region);
  const slices = LocationUtils.getSliceCoordinates(visibleLocations, gridDistance);
  const polygons = LocationUtils.getPolygons(slices);
  const solids = polygons.filter(x => LocationUtils.isSolidPolygon(x));
  const holes = polygons.filter(x => !LocationUtils.isSolidPolygon(x));

  return (
    <View>
      <MapView.Polygon
        fillColor={Colors.brown}
        strokeWidth={0}
        strokeColor={Colors.transparent}
        coordinates={Earth.FOG}
        holes={solids}
      />
      {holes.map((x, i) => (
        <MapView.Polygon
          key={i.toString()}
          fillColor={Colors.brown}
          strokeWidth={0}
          strokeColor={Colors.transparent}
          coordinates={x}
        />
      ))}
    </View>
  );
};

const mapStateToProps = state => ({
  visitedLocations: state.user.get('visitedLocations'),
  friendLocations: state.friend.get('friendLocations'),
  region: state.map.get('region'),
});

export default connect(mapStateToProps)(Fog);
