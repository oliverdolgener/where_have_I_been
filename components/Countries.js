import React, { Component } from 'react';
import { connect } from 'react-redux';
import Region2D from 'region2d';

import Country from './Country';
import * as AllCountries from '../constants/Countries';

class Countries extends Component {
  shouldComponentUpdate(prevProps) {
    const { countries, zoom, region } = this.props;
    return countries != prevProps.countries || zoom > 20 && prevProps.zoom < 20 || zoom < 20 && prevProps.zoom > 20 || region != prevProps.region;
  }

  render() {
    const { countries, zoom, region } = this.props;
    const zoomLevel = zoom > 20 ? 0 : 1;

    const regionLatitude = region.latitude * -1 + 90;
    const regionLongitude = region.longitude + 180;
    const regionLeft = regionLongitude - region.longitudeDelta / 2;
    const regionTop = regionLatitude - region.latitudeDelta / 2;
    const regionRight = regionLongitude + region.longitudeDelta / 2;
    const regionBottom = regionLatitude + region.latitudeDelta / 2;
    const region2d = new Region2D([regionLeft, regionTop, regionRight, regionBottom]);

    const zoomedCountries = zoomLevel == 0 ? AllCountries.zoom0 : AllCountries.zoom1;

    return zoomedCountries.map((x, i) => {
      const country = countries.find(y => y.id == x.id);

      if (!country) {
        return false;
      }

      if (country.region.longitudeDelta == 0) {
        return false;
      }

      const countryLatitude = country.region.latitude * -1 + 90;
      const countryLongitude = country.region.longitude + 180;
      const countryLeft = countryLongitude - country.region.longitudeDelta / 2;
      const countryTop = countryLatitude - country.region.latitudeDelta / 2;
      const countryRight = countryLongitude + country.region.longitudeDelta / 2;
      const countryBottom = countryLatitude + country.region.latitudeDelta / 2;
      const countryRegion = new Region2D([countryLeft, countryTop, countryRight, countryBottom]);

      if (!region2d.doesIntersect(countryRegion)) {
        return false;
      }

      return (
        <Country key={`${i.toString()}-${zoomLevel}`} country={country} geojson={x} />
      );
    });
  }
}

const mapStateToProps = state => ({
  region: state.map.get('region'),
  zoom: state.map.get('zoom'),
  countries: state.country.get('countries'),
});

export default connect(mapStateToProps)(Countries);
