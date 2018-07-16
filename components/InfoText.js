import React from 'react';
import { View, Image, Text } from 'react-native';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'white',
  },
};

const InfoText = (props) => {
  const { label, icon, style } = props;
  return (
    <View style={{ ...styles.container, ...style }}>
      {/* <Image src={icon} /> */}
      <Text>{label}</Text>
    </View>
  );
};

export default InfoText;
