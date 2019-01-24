import React from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';

import { actions as countryActions } from '../reducers/country';
import CountryListItem from './CountryListItem';

const ITEM_HEIGHT = 40;

const CountryList = (props) => {
  const { countries, onCountryPress } = props;

  const toggleStatus = (country) => {
    const { userId, setVacation, setCountries } = props;
    let status = 1;
    if (country.status === 1) {
      status = 2;
    } else if (country.status === 2) {
      status = 0;
    }

    setVacation(userId, country.id, status);
    setCountries(countries.map(x => (x.id === country.id ? { ...x, status } : x)));
  };

  return (
    <FlatList
      data={countries}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <CountryListItem
          item={item}
          onCountryPress={region => onCountryPress(region)}
          onStatusPress={country => toggleStatus(country)}
        />
      )}
      getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
    />
  );
};

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  countries: state.country.get('countries'),
});

const mapDispatchToProps = {
  setVacation: countryActions.setVacation,
  setCountries: countryActions.setCountries,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CountryList);
