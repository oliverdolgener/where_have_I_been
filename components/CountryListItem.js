import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import { connect } from 'react-redux';

import { actions as countryActions } from '../reducers/country';
import StyledText from './StyledText';
import TouchableScale from './TouchableScale';
import iconDone from '../assets/iconDone.png';
import iconToDo from '../assets/iconToDo.png';
import iconHeart from '../assets/iconHeart.png';

const ITEM_HEIGHT = 40;

const styles = StyleSheet.create({
  item: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  label: {
    flex: 1,
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'light',
  },
  status: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

class CountryListItem extends Component {
  shouldComponentUpdate(prevProps) {
    const { item } = this.props;
    if (prevProps.item.status != item.status) {
      return true;
    }
    return false;
  }

  toggleStatus(country) {
    const {
      userId, setVacation, setCountries, countries,
    } = this.props;
    let status = 1;
    if (country.status === 1) {
      status = 2;
    } else if (country.status === 2) {
      status = 0;
    }

    setVacation(userId, country.id, status);
    setCountries(countries.map(x => (x.id === country.id ? { ...x, status } : x)));
  }

  render() {
    const { item, onCountryPress } = this.props;

    let icon = iconToDo;
    if (item.status === 1) {
      icon = iconHeart;
    } else if (item.status === 2) {
      icon = iconDone;
    }

    return (
      <TouchableScale style={styles.item} onPress={() => onCountryPress(item.region)}>
        <Image style={styles.icon} source={item.flag} />
        <StyledText style={styles.label} numberOfLines={1} ellipsizeMode="middle">
          {item.name}
        </StyledText>
        <TouchableScale style={styles.status} onPress={() => this.toggleStatus(item)}>
          <Image style={styles.icon} source={icon} />
        </TouchableScale>
      </TouchableScale>
    );
  }
}

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
)(CountryListItem);
