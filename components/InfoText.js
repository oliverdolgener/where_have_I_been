import React from 'react';
import { Image, Text } from 'react-native';
import { LinearGradient } from 'expo';

import * as Colors from '../constants/Colors';

const styles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    backgroundColor: Colors.white80,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
    tintColor: Colors.black,
  },
  label: {
    minWidth: 40,
    minHeight: 20,
    color: Colors.black,
  },
};

const InfoText = (props) => {
  const {
    label, icon, style, alignRight, gradient,
  } = props;

  const location = gradient || 0;
  const labelAlign = alignRight ? { textAlign: 'right' } : { textAlign: 'center' };

  return (
    <LinearGradient
      style={{ ...styles.container, ...style }}
      colors={[Colors.lightBlue80, 'transparent']}
      start={[0, 0]}
      end={[1, 0]}
      locations={[location, location]}
      pointerEvents="none"
    >
      {icon && <Image style={{ ...styles.icon }} source={icon} />}
      <Text style={{ ...styles.label, ...labelAlign }}>{label}</Text>
    </LinearGradient>
  );
};

export default InfoText;
