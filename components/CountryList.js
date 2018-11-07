import React from 'react';
import {
  FlatList, Text, Image, TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';

import { actions as mapActions } from '../reducers/map';
import Flags from '../constants/Flags';
import iconDone from '../assets/iconDone.png';
import iconToDo from '../assets/iconToDo.png';
import iconHeart from '../assets/iconHeart.png';

const ITEM_HEIGHT = 50;

const styles = {
  item: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  label: {
    flex: 1,
    marginLeft: 10,
    fontSize: 20,
  },
  icon: {
    width: 30,
    height: 30,
  },
};

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

  const getIcon = (status) => {
    let icon = iconToDo;
    if (status === 1) {
      icon = iconHeart;
    } else if (status === 2) {
      icon = iconDone;
    }
    return icon;
  };

  const getFlag = (id) => {
    const match = Flags.find(x => x.id == id);
    return match && match.flag;
  };

  return (
    <FlatList
      data={countries}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          onPress={() => onCountryPress(item.region)}
        >
          <Image style={styles.icon} source={getFlag(item.id)} />
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="middle">{item.name}</Text>
          <TouchableOpacity onPress={() => toggleStatus(item)}>
            <Image style={styles.icon} source={getIcon(item.status)} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      getItemLayout={(data, index) => (
        { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
      )}
    />
  );
};

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  countries: state.map.get('countries'),
});

const mapDispatchToProps = {
  setVacation: mapActions.setVacation,
  setCountries: mapActions.setCountries,
};

export default connect(mapStateToProps, mapDispatchToProps)(CountryList);
