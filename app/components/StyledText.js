import React from 'react';
import { StyleSheet, Text } from 'react-native';

import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  text: {
    fontFamily: 'regular',
    color: Colors.brown,
  },
});

const StyledText = (props) => {
  const { children, style } = props;
  return (
    <Text {...props} style={[styles.text, style]}>
      {children}
    </Text>
  );
};

export default StyledText;
