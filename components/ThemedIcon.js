import React from 'react';
import { Image } from 'react-native';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';

const ThemedIcon = (props) => {
  const { style, theme, source } = props;
  const tintColor = theme === 'dark' ? Colors.white : Colors.black;

  return <Image style={[style, { tintColor }]} source={source} />;
};

const mapStateToProps = state => ({
  theme: state.user.get('theme'),
});

export default connect(mapStateToProps)(ThemedIcon);
