import React from 'react';
import { View, Image, Text } from 'react-native';

const styles = {
  container: {
    width: 80,
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
    label, icon, style, alignRight,
  } = props;

  const labelAlign = alignRight ? { textAlign: 'right' } : { textAlign: 'left' };

  return (
    <View style={{ ...styles.container, ...style }}>
      {icon && <Image style={styles.icon} source={icon} />}
      <Text style={{ ...styles.label, ...labelAlign }}>{label}</Text>
    </View>
  );
};

export default InfoText;
