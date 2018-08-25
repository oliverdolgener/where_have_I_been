import React from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';

const ThemedText = (props) => {
  const { children, style, theme } = props;
  const color = theme === 'dark' ? Colors.white : Colors.black;
  const borderColor = theme === 'dark' ? Colors.white : Colors.black;

  return <Text style={[style, { color, borderColor }]}>{children}</Text>;
};

const mapStateToProps = state => ({
  theme: state.user.get('theme'),
});

export default connect(mapStateToProps)(ThemedText);
