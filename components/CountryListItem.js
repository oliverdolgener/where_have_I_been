import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';

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

  render() {
    const { item, onCountryPress, onStatusPress } = this.props;

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
        <TouchableScale style={styles.status} onPress={() => onStatusPress(item)}>
          <Image style={styles.icon} source={icon} />
        </TouchableScale>
      </TouchableScale>
    );
  }
}

export default CountryListItem;
