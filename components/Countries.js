import React from 'react';
import { connect } from 'react-redux';
import Geojson from 'react-native-geojson';

import AllCountries from '../countries/Countries';
import * as Colors from '../constants/Colors';

const Countries = (props) => {
  const { countries } = props;

  return AllCountries.map((x, i) => {
    const country = countries.find(y => y.id == x.id);
    let color;
    switch (country.status) {
      case 0:
        color = Colors.transparent;
        break;
      case 1:
        color = Colors.red;
        break;
      case 2:
        color = Colors.blue;
        break;
      default:
        color = Colors.transparent;
        break;
    }

    return (
      <Geojson
        key={i.toString()}
        geojson={x}
        fillColor={color}
        strokeWidth={1}
        strokeColor={Colors.creme}
      />
    );
  });
};

const mapStateToProps = state => ({
  countries: state.map.get('countries'),
});

export default connect(mapStateToProps)(Countries);
