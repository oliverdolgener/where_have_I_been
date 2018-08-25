import React from 'react';
import { Image, Text } from 'react-native';
import { LinearGradient } from 'expo';

import * as Colors from '../constants/Colors';

const styles = {
  container: {
    width: 70,
    height: 30,
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
    borderRadius: 5,
    backgroundColor: Colors.white80,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.black,
  },
  label: {
    flex: 1,
  },
};

const InfoText = (props) => {
  const {
    label, icon, style, alignRight, gradient,
  } = props;

  const labelAlign = alignRight ? { textAlign: 'right' } : { textAlign: 'left' };

  return (
    <LinearGradient
      style={{ ...styles.container, ...style }}
      colors={[Colors.lightBlue80, 'transparent']}
      start={[0, 0]}
      end={[1, 0]}
      locations={[gradient, gradient]}
      pointerEvents="none"
    >
      {icon && <Image style={styles.icon} source={icon} />}
      <Text style={{ ...styles.label, ...labelAlign }}>{label}</Text>
    </LinearGradient>
  );
};

export default InfoText;
