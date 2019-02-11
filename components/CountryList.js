import React from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';

import CountryListItem from './CountryListItem';

const ITEM_HEIGHT = 40;

const CountryList = (props) => {
  const { countries, onCountryPress } = props;

  return (
    <FlatList
      data={countries}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <CountryListItem item={item} onCountryPress={region => onCountryPress(region)} />
      )}
      getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
    />
  );
};

const mapStateToProps = state => ({
  countries: state.country.get('countries'),
});

export default connect(mapStateToProps)(CountryList);
