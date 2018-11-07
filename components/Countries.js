import React from 'react';
import { connect } from 'react-redux';
import Geojson from 'react-native-geojson';

import AllCountries from '../constants/Countries';
import * as Colors from '../constants/Colors';

const Countries = (props) => {
  const { countries } = props;

  return AllCountries.map((x, i) => {
    const country = countries.find(y => y.id == x.id);
    let color = Colors.transparent;
    if (country && country.status === 1) {
      color = Colors.rose;
    } else if (country && country.status === 2) {
      color = Colors.green;
    }

    return (
      <Geojson
        key={i.toString()}
        geojson={x}
        fillColor={color}
        strokeWidth={0.5}
        strokeColor={Colors.creme}
      />
    );
  });
};

const mapStateToProps = state => ({
  countries: state.map.get('countries'),
  showCountries: state.map.get('showCountries'),
});

export default connect(mapStateToProps)(Countries);
