import React from 'react';
import { View, Image, Text } from 'react-native';
import { LinearGradient } from 'expo';

const styles = {
  container: {
    width: 70,
    height: 30,
    display: 'flex',
    flexDirection: 'row',
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
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
      colors={['rgba(100, 200, 250, 0.8)', 'transparent']}
      start={[0, 0]}
      end={[1, 0]}
      locations={[gradient, gradient]}
    >
      {icon && <Image style={styles.icon} source={icon} />}
      <Text style={{ ...styles.label, ...labelAlign }}>{label}</Text>
    </LinearGradient>
  );
};

export default InfoText;
