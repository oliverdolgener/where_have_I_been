import React from 'react';
import { StyleSheet, View } from 'react-native';

import StyledText from './StyledText';

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
});

const ProgressListItem = (props) => {
  const { item } = props;
  const percent = Math.round(((item.count * 100) / item.total) * 100) / 100;
  return (
    <View style={styles.item}>
      <StyledText style={styles.label} numberOfLines={1} ellipsizeMode="middle">
        {item.name}
      </StyledText>
      <StyledText style={styles.label} numberOfLines={1} ellipsizeMode="middle">
        {`${percent} %`}
      </StyledText>
    </View>
  );
};

export default ProgressListItem;
