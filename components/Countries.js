import React from 'react';
import { connect } from 'react-redux';
import Geojson from 'react-native-geojson';
import Region2D from 'region2d';

import AllCountries from '../constants/Countries';
import * as Colors from '../constants/Colors';

const Countries = (props) => {
  const { countries, showCountries } = props;

  // const regionLatitude = region.latitude * -1 + 90;
  // const regionLongitude = region.longitude + 180;

  // const regionLeft = regionLongitude - region.longitudeDelta / (2 / 3);
  // const regionTop = regionLatitude - region.latitudeDelta / (2 / 3);
  // const regionRight = regionLongitude + region.longitudeDelta / (2 / 3);
  // const regionBottom = regionLatitude + region.latitudeDelta / (2 / 3);

  // const region2d = new Region2D([regionLeft, regionTop, regionRight, regionBottom]);

  return AllCountries.map((x, i) => {
    const country = countries.find(y => y.id == x.id);
    // if (!country) {
    //   return false;
    // }

    // if (country.region.longitudeDelta === 0) {
    //   return false;
    // }

    // const countryLatitude = country.region.latitude * -1 + 90;
    // const countryLongitude = country.region.longitude + 180;

    // const countryLeft = countryLongitude - country.region.longitudeDelta / 2;
    // const countryTop = countryLatitude - country.region.latitudeDelta / 2;
    // const countryRight = countryLongitude + country.region.longitudeDelta / 2;
    // const countryBottom = countryLatitude + country.region.latitudeDelta / 2;

    // const countryRegion = new Region2D([countryLeft, countryTop, countryRight, countryBottom]);

    // if (!region2d.doesIntersect(countryRegion)) {
    //   return false;
    // }

    let color = Colors.transparent;
    if (country && showCountries) {
      switch (country.status) {
        case 0:
          color = Colors.transparent;
          break;
        case 1:
          color = Colors.rose;
          break;
        case 2:
          color = Colors.green;
          break;
        default:
          color = Colors.transparent;
          break;
      }
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
