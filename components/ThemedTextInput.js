import React from 'react';
import { TextInput } from 'react-native';
import { connect } from 'react-redux';

import * as Colors from '../constants/Colors';

const ThemedText = (props) => {
  const {
    style, theme, placeholder, value, onChangeText, onSubmitEditing,
  } = props;
  const color = theme === 'dark' ? Colors.white : Colors.black;
  const placeholderColor = theme === 'dark' ? Colors.white50 : Colors.black50;

  return (<TextInput
    style={[style, { color }]}
    placeholder={placeholder}
    autoCapitalize="none"
    onChangeText={text => onChangeText(text)}
    value={value}
    selectionColor={color}
    underlineColorAndroid={color}
    placeholderTextColor={placeholderColor}
    returnKeyType="send"
    onSubmitEditing={() => onSubmitEditing()}
  />);
};

const mapStateToProps = state => ({
  theme: state.user.get('theme'),
});

export default connect(mapStateToProps)(ThemedText);
