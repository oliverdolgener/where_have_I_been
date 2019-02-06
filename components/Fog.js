import React from 'react';
import { View } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';
import { Box } from 'js-quadtree';

import LatLng from '../model/LatLng';
import Point from '../model/Point';
import Polygon from '../model/Polygon';
import GeoGrid from '../model/GeoGrid';
import * as Colors from '../constants/Colors';
import * as Earth from '../constants/Earth';

const Fog = (props) => {
  const {
    quadtree, friendQuadtree, region, gridDistance, mapType, shape, showCountries,
  } = props;

  // const holes = [];
  let solids = [];
  let holes = [];

  if (!showCountries) {
    const latlng = { latitude: region.latitude, longitude: region.longitude };
    const point = LatLng.toPoint(latlng);
    const box = new Box(
      point.x - region.longitudeDelta - Earth.BOX_OFFSET,
      point.y - region.latitudeDelta - Earth.BOX_OFFSET,
      (region.longitudeDelta + Earth.BOX_OFFSET) * 2,
      (region.latitudeDelta + Earth.BOX_OFFSET) * 2,
    );
    const points = friendQuadtree ? friendQuadtree.query(box) : quadtree.query(box);
    const visibleLocations = points.map(x => Point.toLatLngRounded(x));
    const slices = GeoGrid.getRectangleSlices(visibleLocations, gridDistance);
    const polygons = Polygon.getPolygons(slices);
    solids = polygons.filter(x => Polygon.isSolid(x));
    holes = polygons.filter(x => !Polygon.isSolid(x));
    console.log(polygons);

    // switch (shape) {
    //   case 'rectangle':
    //     holes = GeoGrid.getRectangleSlices(visibleLocations, gridDistance);
    //     break;
    //   case 'diamond':
    //     holes = GeoGrid.getDiamondSlices(visibleLocations, gridDistance);
    //     break;
    //   case 'grid':
    //     holes = GeoGrid.getRectangles(visibleLocations, gridDistance);
    //     break;
    //   default:
    //     break;
    // }
  }

  return (
    <View>
      <MapView.Polygon
        fillColor={Colors.brown80}
        strokeWidth={shape == 'grid' ? 0.5 : 0}
        strokeColor={mapType == 'hybrid' ? Colors.creme : Colors.brown}
        coordinates={Earth.FOG}
        holes={solids}
      />
    </View>
  );
};

const mapStateToProps = state => ({
  quadtree: state.user.get('quadtree'),
  friendQuadtree: state.friend.get('friendQuadtree'),
  region: state.map.get('region'),
  gridDistance: state.map.get('gridDistance'),
  mapType: state.map.get('mapType'),
  shape: state.map.get('shape'),
  showCountries: state.country.get('showCountries'),
});

export default connect(mapStateToProps)(Fog);
