import React, { Component } from 'react';
import Geojson from 'react-native-geojson';

import * as Colors from '../constants/Colors';

class Country extends Component {
  shouldComponentUpdate(prevProps) {
    const { country } = this.props;
    return country.status != prevProps.country.status;
  }

  render() {
    const { country, geojson } = this.props;

    let color = Colors.brown;
    if (country.status === 1) {
      color = Colors.rose;
    } else if (country.status === 2) {
      color = Colors.green;
    }

    return (
      <Geojson
        geojson={geojson}
        fillColor={color}
        strokeWidth={0.5}
        strokeColor={Colors.creme}
      />
    );
  }
}

export default Country;
