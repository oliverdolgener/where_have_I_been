import React from 'react';
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
  );
  const gridDistance = LocationUtils.getGridDistanceByRegion(region);
  const slices = LocationUtils.getSliceCoordinates(visibleLocations, gridDistance);

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
});

export default connect(mapStateToProps)(Fog);
