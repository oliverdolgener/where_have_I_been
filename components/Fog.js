import React from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';
import * as Earth from '../constants/Earth';

const Fog = (props) => {
  const { holes } = props;
  return (
    <MapView.Polygon
      fillColor={Colors.brown}
      strokeWidth={0}
      strokeColor={Colors.transparent}
      coordinates={Earth.FOG}
      holes={holes}
    />
  );
};

const mapStateToProps = state => ({
  holes: state.user.get('holes'),
});

export default connect(mapStateToProps)(Fog);
