import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';

const ThemedBackground = (props) => {
  const { children, style, theme } = props;
  const backgroundColor = theme === 'dark' ? Colors.black80 : Colors.white80;

  return <View style={[style, { backgroundColor }]}>{children}</View>;
};

const mapStateToProps = state => ({
  theme: state.user.get('theme'),
});

export default connect(mapStateToProps)(ThemedBackground);
