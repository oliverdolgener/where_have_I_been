import React from 'react';
import { View, Image, Text } from 'react-native';

const styles = {
  container: {
    width: 70,
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
    textAlign: 'right',
  },
};

const InfoText = (props) => {
  const { label, icon, style } = props;
  return (
    <View style={{ ...styles.container, ...style }}>
      <Image style={styles.icon} source={icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

export default InfoText;
