import React from 'react';
import { AsyncStorage, View, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { actions as userActions } from '../reducers/user';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 96,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
  },
});

class SplashScreen extends React.Component {
  componentWillMount() {
    this.getUserAsync();
  }

  getUserAsync = async () => {
    const { relogUser, setMapType, setTilesToSave } = this.props;
    const id = await AsyncStorage.getItem('id');
    const mapType = await AsyncStorage.getItem('mapType');
    const tilesToSave = await AsyncStorage.getItem('tilesToSave');
    setTimeout(() => {
      if (id) {
        if (mapType) {
          setMapType(mapType);
        }
        if (tilesToSave) {
          setTilesToSave(JSON.parse(tilesToSave));
        }
        relogUser(id);
      } else {
        this.props.navigation.navigate('Login');
      }
    }, 3000);
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WHIB</Text>
        <Text style={styles.subtitle}>Where Have I Been</Text>
      </View>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  relogUser: userActions.relogUser,
  setMapType: userActions.setMapType,
  setTilesToSave: userActions.setTilesToSave,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SplashScreen);
