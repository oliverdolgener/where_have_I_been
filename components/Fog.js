import React from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import GeoGrid from '../model/GeoGrid';
import * as LocationUtils from '../utils/LocationUtils';
import * as Colors from '../constants/Colors';
import * as Earth from '../constants/Earth';

const Fog = (props) => {
  const {
    region, visitedLocations, friendLocations, shape,
  } = props;

  const visibleLocations = GeoGrid.getVisibleLocations(friendLocations || visitedLocations, region);
  const gridDistance = LocationUtils.getGridDistanceByRegion(region);
  const slices = shape === 'diamond'
    ? GeoGrid.getDiamondSlices(visibleLocations, gridDistance)
    : GeoGrid.getRectangleSlices(visibleLocations, gridDistance);

  return (
    <MapView.Polygon
      fillColor={Colors.brown}
      strokeWidth={0}
      strokeColor={Colors.transparent}
      coordinates={Earth.FOG}
      holes={slices}
    />
  );
};

const mapStateToProps = state => ({
  visitedLocations: state.user.get('visitedLocations'),
  friendLocations: state.friend.get('friendLocations'),
  region: state.map.get('region'),
  shape: state.map.get('shape'),
});

export default connect(mapStateToProps)(Fog);
