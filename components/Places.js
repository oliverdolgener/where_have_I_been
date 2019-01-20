import React from 'react';
import { MapView } from 'expo';
import { connect } from 'react-redux';

const Places = (props) => {
  const { places } = props;
  return places.map(x => (
    <MapView.Marker
      key={x.id.toString()}
      coordinate={x}
      title={x.name}
    />
  ));
};

const mapStateToProps = state => ({
  places: state.map.get('places'),
});

export default connect(mapStateToProps)(Places);
